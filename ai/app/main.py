from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
import dill
import xgboost as xgb
import re
from konlpy.tag import Okt

# 전처리 함수
okt = Okt()

def only_nouns(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^가-힣0-9a-z\s]", "", text)
    nouns = okt.nouns(text)
    stopwords = {"점", "센터", "코너", "플라자", "주식회사", "유한회사"}
    tokens = [w for w in nouns if w not in stopwords and len(w) > 1]
    return " ".join(tokens).strip()

# 모델 로드
with open("/app/models/final_vectorizer.joblib", "rb") as f:
    vectorizer = dill.load(f)

# vectorizer의 preprocessor를 재설정
vectorizer.preprocessor = only_nouns

with open("/app/models/label_encoder.joblib", "rb") as f:
    le = dill.load(f)

booster = xgb.Booster()
booster.load_model("/app/models/best_booster.model")

# FastAPI 앱
app = FastAPI()

class StoreListRequest(BaseModel):
    store_names: List[str]  # 여러 개 받을 수 있도록 리스트로 변경


@app.post("/predict")
async def predict_multiple(request: StoreListRequest):
    processed_texts = [only_nouns(name) for name in request.store_names]
    X = vectorizer.transform(processed_texts)
    dmatrix = xgb.DMatrix(X)
    preds = booster.predict(dmatrix)
    categories = le.inverse_transform(preds.astype(int))

    return [
        {"store_name": name, "category": cat}
        for name, cat in zip(request.store_names, categories)
    ]