'''
Business: API endpoint for retrieving investment analytics data from database
Args: event - dict with httpMethod, queryStringParameters; context - object with request_id
Returns: JSON response with trades, portfolio snapshots, assets allocation, and top holdings
'''

import json
import os
from typing import Dict, Any, List
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    recent_trades = []
    cur.execute("""
        SELECT 
            id,
            ticker,
            trade_type,
            quantity,
            CAST(price AS FLOAT) as price,
            CAST(total AS FLOAT) as total,
            TO_CHAR(trade_time, 'HH24:MI') as time
        FROM trades
        ORDER BY trade_time DESC
        LIMIT 10
    """)
    recent_trades = [dict(row) for row in cur.fetchall()]
    
    portfolio_data = []
    cur.execute("""
        SELECT 
            TO_CHAR(snapshot_date, 'Mon') as month,
            CAST(total_value AS FLOAT) as value,
            CAST(profit AS FLOAT) as profit
        FROM portfolio_snapshots
        ORDER BY snapshot_date ASC
    """)
    portfolio_data = [dict(row) for row in cur.fetchall()]
    
    assets_allocation = []
    cur.execute("""
        SELECT 
            asset_type as asset,
            percentage as percent,
            CAST(value AS FLOAT) as value
        FROM portfolio_assets
        ORDER BY percentage DESC
    """)
    assets_allocation = [dict(row) for row in cur.fetchall()]
    
    top_holdings = []
    cur.execute("""
        SELECT 
            ticker,
            company_name as name,
            change_percent as change,
            CAST(current_value AS FLOAT) as value,
            sector
        FROM top_holdings
        ORDER BY current_value DESC
        LIMIT 5
    """)
    top_holdings = [dict(row) for row in cur.fetchall()]
    
    cur.execute("""
        SELECT 
            SUM(total_value) as total_assets,
            SUM(profit) as total_profit
        FROM portfolio_snapshots
        WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM portfolio_snapshots)
    """)
    summary_row = cur.fetchone()
    summary = dict(summary_row) if summary_row else {'total_assets': 0, 'total_profit': 0}
    
    cur.execute("""
        SELECT COUNT(*) as total_trades
        FROM trades
        WHERE trade_time::date = CURRENT_DATE
    """)
    today_trades_row = cur.fetchone()
    today_trades = dict(today_trades_row) if today_trades_row else {'total_trades': 0}
    
    cur.close()
    conn.close()
    
    response_data = {
        'trades': recent_trades,
        'portfolio': portfolio_data,
        'assets': assets_allocation,
        'topHoldings': top_holdings,
        'summary': {
            'totalAssets': float(summary.get('total_assets', 0)),
            'totalProfit': float(summary.get('total_profit', 0)),
            'todayTrades': int(today_trades.get('total_trades', 0))
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_data, default=decimal_to_float),
        'isBase64Encoded': False
    }