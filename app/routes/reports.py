from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import require_roles
from app.schemas.report import (
    OccupancyResponse,
    ADRResponse,
    RevPARResponse
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ============================================================
# 1. OCCUPANCY REPORT
# ============================================================

@router.get(
    "/occupancy",
    response_model=list[OccupancyResponse]
)
def get_occupancy(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_account=Depends(require_roles("owner", "manager"))
):

    query = text("""
        WITH days AS (
            SELECT
                generate_series(
                    make_date(:year, :month, 1),
                    (
                        make_date(:year, :month, 1)
                        + interval '1 month'
                        - interval '1 day'
                    )::date,
                    interval '1 day'
                )::date AS day
        ),

        room_days AS (
            SELECT
                r.property_id,
                r.room_id,
                d.day
            FROM rooms r
            CROSS JOIN days d
        ),

        occupied_days AS (
            SELECT
                rd.property_id,
                rd.room_id,
                rd.day
            FROM room_days rd

            INNER JOIN bookings b
                ON b.room_id = rd.room_id
                AND b.stay @> rd.day
                AND b.status NOT IN (
                    'cancelled',
                    'no_show'
                )
        )

        SELECT
            rd.property_id,

            make_date(
                :year,
                :month,
                1
            ) AS month,

            ROUND(
                (
                    COUNT(od.room_id)::numeric
                    /
                    NULLIF(
                        COUNT(rd.room_id),
                        0
                    )::numeric
                ) * 100,
                2
            ) AS occupancy_rate

        FROM room_days rd

        LEFT JOIN occupied_days od
            ON od.property_id = rd.property_id
            AND od.room_id = rd.room_id
            AND od.day = rd.day

        GROUP BY
            rd.property_id

        ORDER BY
            rd.property_id
    """)

    result = db.execute(
        query,
        {
            "year": year,
            "month": month
        }
    )

    return [
        {
            "property_id": row.property_id,
            "month": row.month,
            "occupancy_rate": float(
                row.occupancy_rate or 0
            )
        }
        for row in result
    ]


# ============================================================
# 2. ADR REPORT
# ============================================================

@router.get(
    "/adr",
    response_model=list[ADRResponse]
)
def get_adr(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_account=Depends(require_roles("owner", "manager"))
):

    query = text("""
        WITH month_range AS (

            SELECT
                make_date(
                    :year,
                    :month,
                    1
                ) AS month_start,

                (
                    make_date(
                        :year,
                        :month,
                        1
                    )
                    + interval '1 month'
                )::date AS month_end
        ),

        booking_nights AS (

            SELECT
                r.property_id,
                b.booking_id,
                b.nightly_rate,

                GREATEST(
                    0,
                    LEAST(
                        UPPER(b.stay)::date,
                        mr.month_end
                    )
                    -
                    GREATEST(
                        LOWER(b.stay)::date,
                        mr.month_start
                    )
                ) AS room_nights

            FROM bookings b

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            CROSS JOIN month_range mr

            WHERE
                b.status NOT IN (
                    'cancelled',
                    'no_show'
                )

                AND b.stay && daterange(
                    mr.month_start,
                    mr.month_end,
                    '[)'
                )
        ),

        revenue_data AS (

            SELECT
                property_id,

                SUM(
                    nightly_rate * room_nights
                ) AS revenue,

                SUM(
                    room_nights
                ) AS room_nights_sold

            FROM booking_nights

            WHERE room_nights > 0

            GROUP BY
                property_id
        )

        SELECT
            property_id,

            make_date(
                :year,
                :month,
                1
            ) AS month,

            ROUND(
                revenue
                /
                NULLIF(
                    room_nights_sold,
                    0
                ),
                2
            ) AS adr

        FROM revenue_data

        ORDER BY
            property_id
    """)

    result = db.execute(
        query,
        {
            "year": year,
            "month": month
        }
    )

    return [
        {
            "property_id": row.property_id,
            "month": row.month,
            "adr": float(
                row.adr or 0
            )
        }
        for row in result
    ]


# ============================================================
# 3. REVPAR REPORT
# ============================================================

@router.get(
    "/revpar",
    response_model=list[RevPARResponse]
)
def get_revpar(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_account=Depends(require_roles("owner", "manager"))
):

    query = text("""
        WITH days AS (

            SELECT
                generate_series(
                    make_date(
                        :year,
                        :month,
                        1
                    ),

                    (
                        make_date(
                            :year,
                            :month,
                            1
                        )
                        + interval '1 month'
                        - interval '1 day'
                    )::date,

                    interval '1 day'
                )::date AS day
        ),

        room_days AS (

            SELECT
                r.property_id,
                r.room_id,
                d.day

            FROM rooms r

            CROSS JOIN days d
        ),

        occupied_days AS (

            SELECT
                rd.property_id,
                rd.room_id,
                rd.day,
                b.nightly_rate

            FROM room_days rd

            INNER JOIN bookings b
                ON b.room_id = rd.room_id
                AND b.stay @> rd.day
                AND b.status NOT IN (
                    'cancelled',
                    'no_show'
                )
        ),

        revenue_data AS (

            SELECT
                property_id,

                SUM(
                    nightly_rate
                ) AS total_revenue

            FROM occupied_days

            GROUP BY
                property_id
        )

        SELECT
            rd.property_id,

            make_date(
                :year,
                :month,
                1
            ) AS month,

            ROUND(
                COALESCE(
                    revenue_data.total_revenue,
                    0
                )
                /
                NULLIF(
                    COUNT(rd.room_id),
                    0
                ),
                2
            ) AS revpar

        FROM room_days rd

        LEFT JOIN revenue_data
            ON revenue_data.property_id =
               rd.property_id

        GROUP BY
            rd.property_id,
            revenue_data.total_revenue

        ORDER BY
            rd.property_id
    """)

    result = db.execute(
        query,
        {
            "year": year,
            "month": month
        }
    )

    return [
        {
            "property_id": row.property_id,
            "month": row.month,
            "revpar": float(
                row.revpar or 0
            )
        }
        for row in result
    ]