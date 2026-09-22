from sqlalchemy import text
from app.db import SessionLocal

db = SessionLocal()

print("Database:", db.execute(
    text("SELECT current_database()")
).scalar())

print("Schema:", db.execute(
    text("SELECT current_schema()")
).scalar())

print("\nRate plan columns:")

result = db.execute(
    text("""
        SELECT
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rate_plans'
        ORDER BY ordinal_position
    """)
)

for row in result:
    print(row)

db.close()