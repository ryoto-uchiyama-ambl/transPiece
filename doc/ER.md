erDiagram
    Users ||--o{ Progress: ""
    Users ||--o{ Vocabularies: ""
    Users ||--o{ Translations: ""
    Books ||--o{ Pages: ""
    Books ||--o{ Progress: ""
    Books ||--o{ Vocabularies: ""
    Pages ||--o{ Translations: ""
    Pages ||--o{ Vocabularies: ""

    Users{
        bigint id PK
        varchar(255) name
        varchar(255) email
        timestamp email_verified_at
        varchar(255) password
        varchar(100) remember_token
        bigint book_id FK "現在の書籍"
    }

    Books{
        bigint id PK
        varchar(255) title
        text gutenberg_url "書籍毎のURL情報"
        varchar(255) author
        int downloads
        varchar(10) lang "EN,JP,DE,FR,RU"
        int page_count "総ページ数"
    }

    Pages{
        bigint id PK
        bigint book_id PK
        int page_number "何ページ目か"
        longtext content "ページ毎の本文"
    }

    Progress{
        bigint id PK
        bigint user_id FK
        bigint book_id FK
        int content_page "現在のページ"
        tinyint(1) is_favorite "ブックマーク"
    }

    Vocabularies{
        bigint id PK
        bigint user_id FK
        bigint book_id FK
        bigint page_id FK
        varchar(255) word "翻訳前の単語"
        varchar(255) translation "翻訳語の単語"
        longtext definition "単語定義"
        longtext example "例文"
        varchar(255) part_of_speech "品詞"
        varchar(255) language "翻訳前の言語"
        tinyint(1) is_understanding "理解済みか否か"
    }

    Translations{
        bigint id PK
        bigint user_id FK
        bigint page_id FK
        longtext translated_text
        double(8,2) score
        longtext AI_feedback
    }