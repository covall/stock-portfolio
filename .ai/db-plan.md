# Schemat bazy danych - Stock Portfolio (MVP)

## 1. Tabele

### 1.1. transactions

- `id`: SERIAL PRIMARY KEY
- `user_id`: UUID NOT NULL -- FOREIGN KEY odnoszący się do tabeli Supabase (auth.users)
- `transaction_date`: TIMESTAMPTZ NOT NULL, CHECK (transaction_date <= CURRENT_TIMESTAMP)
- `transaction_type`: ENUM('buy', 'sell') NOT NULL
- `stock_symbol`: VARCHAR(10) NOT NULL
- `quantity`: NUMERIC(15,4) NOT NULL, CHECK (quantity > 0)
- `price`: NUMERIC(15,4) NOT NULL, CHECK (price > 0)
- `currency`: ENUM('USD', 'EUR', 'PLN') NOT NULL

### 1.2. cash_balances

- `user_id`: UUID NOT NULL -- FOREIGN KEY odnoszący się do tabeli Supabase (auth.users)
- `currency`: ENUM('USD', 'EUR', 'PLN') NOT NULL
- `balance`: NUMERIC(15,4) NOT NULL DEFAULT 0
- PRIMARY KEY (`user_id`, `currency`)

### 1.3. exchange_rates

- `id`: SERIAL PRIMARY KEY
- `base_currency`: VARCHAR(3) NOT NULL
- `target_currency`: VARCHAR(3) NOT NULL
- `rate`: NUMERIC(15,4) NOT NULL
- `timestamp`: TIMESTAMPTZ NOT NULL

### 1.4. stock_prices

- `id`: SERIAL PRIMARY KEY
- `stock_symbol`: VARCHAR(10) NOT NULL
- `price`: NUMERIC(15,4) NOT NULL
- `timestamp`: TIMESTAMPTZ NOT NULL

## 2. Relacje między tabelami

- W tabeli `transactions`, `user_id` odnosi się do `auth.users(id)`.
- W tabeli `cash_balances`, `user_id` odnosi się do `auth.users(id)`.

## 3. Indeksy

- Tabela `transactions`:
  - Indeks na kolumnie `user_id`
  - Indeks na kolumnie `transaction_date`
  - Indeks na kolumnie `stock_symbol`
- Tabela `exchange_rates`:
  - Indeks na kolumnie `timestamp`
- Tabela `stock_prices`:
  - Indeks na kolumnie `timestamp`

## 4. Zasady PostgreSQL (RLS)

- Mechanizmy Row Level Security (RLS) zostaną wdrożone na tabelach `transactions` oraz `cash_balances` zgodnie z domyślnymi politykami Supabase, aby użytkownik miał dostęp tylko do swoich danych.

## 5. Uwagi projektowe

- Użytkownicy są zarządzani przez domyślną tabelę Supabase (`auth.users`), wykorzystującą klucz UUID.
- W tabeli `transactions` wykorzystano ENUM dla `transaction_type` z wartościami: 'buy' i 'sell'.
- Waluty w tabelach `transactions` i `cash_balances` są ograniczone do: USD, EUR oraz PLN.
- Pola pieniężne i cenowe zostały zadeklarowane jako NUMERIC(15,4) zapewniając wysoką precyzję.
- Ograniczenia CHECK w tabeli `transactions` zapewniają, że data transakcji nie jest z przyszłości, a wartości `quantity` i `price` są większe od zera.
- Zdefiniowane indeksy poprawiają wydajność zapytań na kluczowych kolumnach.
