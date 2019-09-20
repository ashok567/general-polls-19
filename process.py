import pandas as pd


def read_data():
    df = pd.read_csv('data/data.csv')
    df = df.to_json(orient='records')
    return df
