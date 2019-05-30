import pandas as pd
import json

def read_data():
    df = pd.read_csv('static/data/data.csv')
    df = df.to_json(orient='records')
    return df