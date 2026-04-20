import os
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import uuid
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Database Configuration
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3307")
DB_NAME = os.getenv("DB_NAME", "ecommerce_analytics")

# Create SQLAlchemy Engine
engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def clean_data(df, required_cols=None):
    """
    Eksik verilerin, kopyaların ve tutarsız formatların temizlenmesi (Data Cleansing).
    """
    initial_shape = df.shape
    # Kopyaları kaldır
    df = df.drop_duplicates()
    
    # Sadece belirlenen kritik kolonlarda eksik veri varsa o satırları sil
    if required_cols:
        existing_cols = [c for c in required_cols if c in df.columns]
        df = df.dropna(subset=existing_cols)
    else:
        # Aksi halde tüm nan'leri düşür (veya fillna yapılabilir)
        df = df.dropna()
        
    logger.info(f"Data Cleaning: {initial_shape[0]} satırdan {df.shape[0]} satıra düştü.")
    return df

def convert_to_iso8601(df, date_columns):
    """
    Tüm tarih formatlarının standart ISO 8601 formatına dönüştürülmesi.
    """
    for col in date_columns:
        if col in df.columns:
            # pd.to_datetime farklı formatları otomatik algılar ve coerce ile hatalı olanları NaT yapar
            df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%Y-%m-%dT%H:%M:%S')
    return df

def normalize_currency(df, price_columns, exchange_rate=1.0):
    """
    Farklı veri setlerinden gelen para birimlerinin tek bir para birimine (USD) normalize edilmesi.
    exchange_rate: 1 USD'ye karşılık gelen hedef miktar ile çarpım (Örn: INR'den USD'ye çeviriyorsak 1/83).
    """
    for col in price_columns:
        if col in df.columns:
            # Nümerik olmayan karakterleri ($, £, vb.) temizle
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.replace(r'[^\d.]', '', regex=True)
            df[col] = pd.to_numeric(df[col], errors='coerce') * exchange_rate
    return df

def generate_surrogate_key():
    """
    Farklı tablolardan gelen verileri birleştirirken tutarlı ID'ler (Surrogate keys) oluşturulması.
    Veritabanında çakışmayı önlemek için UUID'nin integer karşılığı kullanılabilir, 
    ancak auto_increment MySQL id'leri için DataFrame seviyesinde sayaç kullanacağız.
    """
    pass # ID atamalarını birleştirme aşamasında toplu yapacağız.

def load_uci_online_retail():
    filepath = os.path.join(DATA_DIR, 'OnlineRetail.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    
    logger.info("Loading UCI Online Retail Dataset...")
    # encoding ayarı gerekebilir
    df = pd.read_csv(filepath, encoding='unicode_escape')
    df = clean_data(df, required_cols=['InvoiceNo', 'StockCode', 'CustomerID'])
    df = convert_to_iso8601(df, ['InvoiceDate'])
    df = normalize_currency(df, ['UnitPrice'], exchange_rate=1.25) # GBP to USD
    
    # Tablolara ayır
    # Customers -> Users (Sadece CustomerID)
    users_df = pd.DataFrame({
        'ext_id': 'uci_' + df['CustomerID'].astype(int).astype(str),
        'email': 'uci_' + df['CustomerID'].astype(int).astype(str) + '@example.com',
        'password_hash': 'hashed_password',
        'role_type': 'INDIVIDUAL',
        'gender': 'OTHER'
    }).drop_duplicates()

    # Products
    products_df = pd.DataFrame({
        'ext_id': 'uci_' + df['StockCode'].astype(str),
        'sku': 'uci_' + df['StockCode'].astype(str),
        'name': df['Description'].str.slice(0, 255),
        'unit_price': df['UnitPrice'],
        'store_id': 1 # Varsayılan Store
    }).drop_duplicates(subset=['ext_id'])

    # Orders (InvoiceNo)
    orders_df = pd.DataFrame({
        'ext_id': 'uci_' + df['InvoiceNo'].astype(str),
        'user_ext_id': 'uci_' + df['CustomerID'].astype(int).astype(str),
        'store_id': 1,
        'status': 'DELIVERED',
        'date': df['InvoiceDate']
    }).drop_duplicates(subset=['ext_id'])
    
    return users_df, products_df, orders_df

def load_amazon_sales():
    filepath = os.path.join(DATA_DIR, 'Amazon Sale Report.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    
    logger.info("Loading Amazon Sales Dataset...")
    df = pd.read_csv(filepath, low_memory=False)
    df = clean_data(df, required_cols=['Order ID', 'SKU', 'Amount'])
    df = convert_to_iso8601(df, ['Date'])
    df = normalize_currency(df, ['Amount'], exchange_rate=0.012) # INR to USD
    
    # Products
    products_df = pd.DataFrame({
        'ext_id': 'amz_' + df['SKU'].astype(str),
        'sku': 'amz_' + df['SKU'].astype(str),
        'name': df['Category'].astype(str) + ' Product',
        'unit_price': df['Amount'] / df['Qty'].replace(0, 1),
        'store_id': 2 # Varsayılan Store Amazon
    }).drop_duplicates(subset=['ext_id'])

    # Orders
    orders_df = pd.DataFrame({
        'ext_id': 'amz_' + df['Order ID'].astype(str),
        'user_ext_id': 'anonymous', # Anonim kullanıcı
        'store_id': 2,
        'status': 'DELIVERED',
        'date': df['Date']
    }).drop_duplicates(subset=['ext_id'])

    return pd.DataFrame(), products_df, orders_df

def load_customer_behavior():
    filepath = os.path.join(DATA_DIR, 'Customer_Behavior.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    logger.info("Loading E-Commerce Customer Behavior Dataset...")
    # Sadece okuyup boş dataframe döndürüyoruz, CSV yapısı gelince doldurulabilir.
    return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def load_shipping_data():
    filepath = os.path.join(DATA_DIR, 'Shipping_Data.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    logger.info("Loading E-Commerce Shipping Data...")
    return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def load_pakistan_ecommerce():
    filepath = os.path.join(DATA_DIR, 'Pakistan_Ecommerce.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    logger.info("Loading Pakistan's Largest E-Commerce Dataset...")
    return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def load_amazon_reviews():
    filepath = os.path.join(DATA_DIR, 'Amazon_Reviews.csv')
    if not os.path.exists(filepath):
        logger.warning(f"File not found: {filepath}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    logger.info("Loading Amazon US Customer Reviews Dataset...")
    return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def run_etl():
    logger.info("Starting ETL Pipeline...")
    
    # 1. Extract & Transform Local Data
    uci_users, uci_products, uci_orders = load_uci_online_retail()
    amz_users, amz_products, amz_orders = load_amazon_sales()
    beh_users, beh_products, beh_orders = load_customer_behavior()
    shp_users, shp_products, shp_orders = load_shipping_data()
    pak_users, pak_products, pak_orders = load_pakistan_ecommerce()
    rev_users, rev_products, rev_orders = load_amazon_reviews()
    
    # Birleştir
    all_users = pd.concat([uci_users, amz_users, beh_users, shp_users, pak_users, rev_users]).drop_duplicates(subset=['ext_id'])
    all_products = pd.concat([uci_products, amz_products, beh_products, shp_products, pak_products, rev_products]).drop_duplicates(subset=['ext_id'])
    all_orders = pd.concat([uci_orders, amz_orders, beh_orders, shp_orders, pak_orders, rev_orders]).drop_duplicates(subset=['ext_id'])
    
    if all_users.empty and all_products.empty:
        logger.error("No data found in data/ directory. Please download CSV files manually as requested.")
        return

    # 2. Surrogate Keys Oluşturma (Tutarlı ID'ler)
    # MySQL'deki tabloların AUTO_INCREMENT değerleriyle çakışmamak için ID'leri 10000'den başlatıyoruz.
    logger.info("Generating Surrogate Keys...")
    
    all_users['id'] = range(10000, 10000 + len(all_users))
    user_id_map = dict(zip(all_users['ext_id'], all_users['id']))
    
    all_products['id'] = range(10000, 10000 + len(all_products))
    product_id_map = dict(zip(all_products['ext_id'], all_products['id']))
    
    all_orders['id'] = range(10000, 10000 + len(all_orders))
    
    # Foreign Key eşleştirmeleri
    all_orders['user_id'] = all_orders['user_ext_id'].map(user_id_map).fillna(1) # anonymous -> 1 (Seed data user)
    
    # Grand Total hesabı
    all_orders['grand_total'] = 100.0 # Placeholder
    
    # Temizleme
    final_users = all_users[['id', 'email', 'password_hash', 'role_type', 'gender']]
    final_products = all_products[['id', 'store_id', 'sku', 'name', 'unit_price']]
    final_orders = all_orders[['id', 'user_id', 'store_id', 'status', 'grand_total']]

    # 3. Load to Database
    logger.info("Loading Data to MySQL Database...")
    try:
        # DB bağlantısını test et
        with engine.connect() as conn:
            # Users
            if not final_users.empty:
                final_users.to_sql('users', con=engine, if_exists='append', index=False)
                logger.info(f"Inserted {len(final_users)} users.")
            
            # Products
            if not final_products.empty:
                final_products.to_sql('products', con=engine, if_exists='append', index=False)
                logger.info(f"Inserted {len(final_products)} products.")
            
            # Orders
            if not final_orders.empty:
                final_orders.to_sql('orders', con=engine, if_exists='append', index=False)
                logger.info(f"Inserted {len(final_orders)} orders.")
                
        logger.info("ETL Pipeline completed successfully.")
    except Exception as e:
        logger.error(f"Error during database insertion: {e}")

if __name__ == "__main__":
    run_etl()
