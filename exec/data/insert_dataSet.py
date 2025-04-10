import os

import dotenv
import pandas as pd
import psycopg2
import io
from tqdm import tqdm
from dotenv import load_dotenv

# ============================
# 1. CSV 정제 단계
# ============================
def clean_csv_files(source_folder, save_folder, columns_to_keep):
    os.makedirs(save_folder, exist_ok=True)
    for filename in os.listdir(source_folder):
        if not filename.endswith('.csv'):
            continue

        file_path = os.path.join(source_folder, filename)
        try:
            df = pd.read_csv(file_path, encoding='cp949',
                             usecols=columns_to_keep)
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, encoding='utf-8-sig',
                             usecols=columns_to_keep)

        df_filtered = df.drop_duplicates(subset=columns_to_keep)

        save_path = os.path.join(save_folder, f'filtered_{filename}')
        df_filtered.to_csv(save_path, index=False, encoding='utf-8-sig')
        print(f"✅ {filename} 정제 완료: {save_path}")


# ============================
# 2. 병합 + 카테고리 매핑 단계
# ============================
category_mapping = {
    "FOOD": ["I201", "I202", "I203", "I204", "I205", "I206", "I207", "I210", "I211", "I212", "G204", "G205", "G206"],
    "TRANSPORT": ["G214", "N109", "S203"],
    "HOUSING": ["L102", "D101", "D102", "D103"],
    "MEDICAL": ["Q101", "Q102", "Q104", "G215", "M111"],
    "CULTURE": ["R102", "R103", "R104", "I101", "I102", "N110"],
    "SHOPPING": ["G202", "G203", "G208", "G209", "G210", "G211", "G212", "G216", "G217", "G218", "G219", "G220", "G221", "G222"],
    "EDUCATION": ["P105", "P106", "P107", "G213"],
    "ETC": ["M103", "M104", "M105", "M106", "M107", "M109", "M112", "M113", "M114", "M115",
             "N101", "N102", "N103", "N104", "N105", "N107", "N108", "N111",
             "S201", "S202", "S204", "S205", "S206", "S207", "S208", "S209", "S210", "S211", "G207"]
}

def get_category(code):
    for category, codes in category_mapping.items():
        if str(code)[:4] in codes:
            return category
    return "ETC"

def merge_cleaned_files(read_folder, output_path):
    all_data = []
    file_list = [f for f in os.listdir(read_folder) if f.endswith('.csv')]
    for filename in tqdm(file_list, desc="📁 파일 병합 중"):
        file_path = os.path.join(read_folder, filename)
        try:
            df = pd.read_csv(file_path, encoding='utf-8-sig', usecols=['상호명', '상권업종중분류코드'])
            df.columns = ['store_name', 'code']
            df['category'] = df['code'].apply(get_category)
            df['keyword'] = df['store_name']
            all_data.append(df[['category', 'keyword']])
        except Exception as e:
            print(f"❌ {filename} 읽기 실패: {e}")

    merged_df = pd.concat(all_data).drop_duplicates(subset='keyword')
    merged_df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"\n✅ 병합된 데이터 저장 완료: {output_path} (총 {len(merged_df)}행)")
    return merged_df


# ============================
# 3. DB 업로드 단계
# ============================
def upload_to_postgres(df, table_name, conn_info, chunk_size=10000):
    conn = psycopg2.connect(**conn_info)
    cur = conn.cursor()
    try:
        for i in tqdm(range(0, len(df), chunk_size), desc="📤 DB 업로드 중"):
            chunk = df.iloc[i:i + chunk_size]
            buffer = io.StringIO()
            chunk.to_csv(buffer, index=False, header=False, encoding='utf-8')
            buffer.seek(0)
            cur.copy_from(buffer, table_name, sep=',', columns=('category', 'keyword'))
            conn.commit()
        print("✅ 전체 업로드 완료")
    except Exception as e:
        print(f"❌ 업로드 중 오류 발생: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


# ============================
# Main 실행 흐름
# ============================
if __name__ == "__main__":
    # 현재 실행 기준 상대경로
    base_dir = os.path.dirname(os.path.abspath(__file__))
    source_folder = os.path.join(base_dir, 'read')
    save_folder = os.path.join(base_dir, 'save')
    merged_csv_path = os.path.join(base_dir, '소상공인시장진흥공단_상가(상권)정보_202412.csv')
    columns_to_keep = ['상호명', '상권업종중분류코드']

    # DB 접속 정보
    load_dotenv()

    conn_info = {
        'host': os.getenv('DB_HOST'),
        'port': int(os.getenv('DB_PORT')),
        'dbname': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD')
    }

    # 실행 단계
    clean_csv_files(source_folder, save_folder, columns_to_keep)
    merged_df = merge_cleaned_files(save_folder, merged_csv_path)
    #upload_to_postgres(merged_df, 'spend_category', conn_info)