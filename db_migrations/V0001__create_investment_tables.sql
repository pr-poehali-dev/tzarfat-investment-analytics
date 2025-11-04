-- Создание таблиц для инвестиционного фонда

-- Таблица для торговых операций
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('Покупка', 'Продажа')),
    quantity INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    trade_time TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица для состояния портфеля
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    profit DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица для активов в портфеле
CREATE TABLE IF NOT EXISTS portfolio_assets (
    id SERIAL PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL,
    percentage INTEGER NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица для топ активов
CREATE TABLE IF NOT EXISTS top_holdings (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    change_percent VARCHAR(10) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_trades_time ON trades(trade_time DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_date ON portfolio_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_ticker ON trades(ticker);

-- Вставка тестовых данных для торговых операций
INSERT INTO trades (ticker, trade_type, quantity, price, total, trade_time) VALUES
('AAPL', 'Покупка', 50, 178.50, 8925.00, NOW() - INTERVAL '1 hour'),
('TSLA', 'Продажа', 25, 242.30, 6057.50, NOW() - INTERVAL '2 hours'),
('MSFT', 'Покупка', 30, 378.20, 11346.00, NOW() - INTERVAL '3 hours'),
('GOOGL', 'Покупка', 15, 141.80, 2127.00, NOW() - INTERVAL '4 hours'),
('NVDA', 'Покупка', 20, 493.00, 9860.00, NOW() - INTERVAL '5 hours');

-- Вставка данных для снимков портфеля (последние 6 месяцев)
INSERT INTO portfolio_snapshots (snapshot_date, total_value, profit) VALUES
('2024-06-01', 1250000.00, 45000.00),
('2024-07-01', 1320000.00, 70000.00),
('2024-08-01', 1280000.00, -40000.00),
('2024-09-01', 1450000.00, 170000.00),
('2024-10-01', 1580000.00, 130000.00),
('2024-11-01', 1620000.00, 40000.00);

-- Вставка данных о структуре портфеля
INSERT INTO portfolio_assets (asset_type, percentage, value) VALUES
('Акции', 45, 729000.00),
('Облигации', 30, 486000.00),
('Валюта', 15, 243000.00),
('Деривативы', 10, 162000.00);

-- Вставка топ активов
INSERT INTO top_holdings (ticker, company_name, change_percent, current_value, sector) VALUES
('AAPL', 'Apple Inc.', '+12.4%', 178500.00, 'Technology'),
('MSFT', 'Microsoft Corp.', '+8.7%', 145200.00, 'Technology'),
('NVDA', 'NVIDIA Corp.', '+24.1%', 98600.00, 'Technology'),
('GOOGL', 'Alphabet Inc.', '+6.2%', 82300.00, 'Technology'),
('JPM', 'JPMorgan Chase', '+5.3%', 76500.00, 'Finance');
