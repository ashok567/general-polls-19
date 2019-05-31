from bs4 import BeautifulSoup
import pandas as pd
import json

def read_data():
    df = pd.read_csv('static/data/data.csv')
    df = df.to_json(orient='records')
    return df

def extract_data():
    url = 'https://timesofindia.indiatimes.com/elections/results'
    soup = BeautifulSoup(url, 'lxml')
    test = soup.find("div", property="id:stateBody")
    return test