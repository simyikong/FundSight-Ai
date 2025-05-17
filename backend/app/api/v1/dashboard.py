from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ...core.database import get_db
from datetime import datetime, timedelta
import pandas as pd
from app.services.financial_health import FinancialHealthAnalyzer
from app.services.executive_summary import ExecutiveSummaryGenerator
from app.core.config import settings
from app.models.financial import MonthlyFinancialData
from sqlalchemy import create_engine

router = APIRouter()

# Initialize services
executive_summary = ExecutiveSummaryGenerator(settings.DB_PATH, settings.QWEN_API_KEY)

class Metric(BaseModel):
    title: str
    value: float
    change: float
    color: str
    tooltip: str = ""

class BudgetCategory(BaseModel):
    name: str
    spent: float
    budget: float

class BudgetGoal(BaseModel):
    goal: float

class ExecutiveSummaryRequest(BaseModel):
    start_date: str
    end_date: str

@router.get("/metrics", response_model=List[Metric])
def get_metrics(db: Session = Depends(get_db)):
    """Get key financial metrics"""
    try:
        analyzer = FinancialHealthAnalyzer(db)
        latest_records = db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month.desc()).limit(2).all()

        if not latest_records:
            raise HTTPException(status_code=404, detail="No financial data available")

        latest = latest_records[0]
        previous = latest_records[1] if len(latest_records) > 1 else latest

        revenue_change = latest.Revenue_Growth_MoM
        profit_change = (latest.Net_Profit - previous.Net_Profit) / previous.Net_Profit if previous.Net_Profit != 0 else 0
        mrr_change = (latest.MRR - previous.MRR) / previous.MRR if previous.MRR != 0 else 0

        return [
            {
                "title": "Monthly Revenue",
                "value": latest.Revenue,
                "change": revenue_change,
                "color": "#2196F3",
                "tooltip": f"Revenue Growth MoM: {revenue_change:.1f}%"
            },
            {
                "title": "Net Profit",
                "value": latest.Net_Profit,
                "change": profit_change * 100,
                "color": "#4CAF50",
                "tooltip": f"Profit Margin: {latest.Profit_Margin:.1f}%"
            },
            {
                "title": "Monthly Recurring Revenue",
                "value": latest.MRR,
                "change": mrr_change * 100,
                "color": "#9C27B0",
                "tooltip": f"MRR: RM{latest.MRR:,.2f}"
            }
        ]

    except HTTPException as e:
        raise e  # Let FastAPI handle it as-is

    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@router.get("/chart-data")
def get_chart_data(db: Session = Depends(get_db)):
    """Get revenue and expenses data"""
    try:
        # Query all financial records
        records = db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month.asc()).all()
        if not records:
            return {"historical": {"dates": [], "revenue": [], "profit": [], "cash_inflow": [], "cash_outflow": []}, "forecast": {"dates": [], "revenue": [], "profit": [], "cash_inflow": [], "cash_outflow": []}}
        # Convert to DataFrame
        df = pd.DataFrame([r.__dict__ for r in records])
        if 'Report_Month' in df.columns:
            df['Report_Month'] = pd.to_datetime(df['Report_Month'], errors='coerce')
        df = df.sort_values('Report_Month')
        # Prepare chart data
        historical = {
            "dates": df['Report_Month'].dt.strftime('%Y-%m').tolist(),
            "revenue": df['Revenue'].tolist(),
            "profit": df['Net_Profit'].tolist(),
            "cash_inflow": df['Cash_Inflow'].tolist(),
            "cash_outflow": df['Cash_Outflow'].tolist(),
        }
        return {"historical": historical, "forecast": {"dates": [], "revenue": [], "profit": [], "cash_inflow": [], "cash_outflow": []}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/budget-categories", response_model=List[BudgetCategory])
def get_budget_categories(db: Session = Depends(get_db)):
    """Get budget categories with actual vs budgeted amounts"""
    try:
        # Get latest record
        latest = db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month.desc()).first()
        
        if not latest:
            raise HTTPException(status_code=404, detail="No budget data available")

        return [
            BudgetCategory(
                name="Payroll",
                spent=latest.Payroll,
                budget=30000
            ),
            BudgetCategory(
                name="Marketing & Advertising",
                spent=latest.Marketing_Advertising,
                budget=8500
            ),
            BudgetCategory(
                name="Research & Development",
                spent=latest.Research_Development,
                budget=16000
            ),
            BudgetCategory(
                name="Office Rent & Utilities",
                spent=latest.Office_Rent_Utilities,
                budget=12000
            ),
            BudgetCategory(
                name="Logistics & Delivery",
                spent=latest.Logistics_Delivery,
                budget=6000
            ),
            BudgetCategory(
                name="Miscellaneous",
                spent=latest.Miscellaneous,
                budget=3000
            )
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/budget-suggestions")
def get_budget_suggestions(goal: BudgetGoal, categories: List[Dict], db: Session = Depends(get_db)):
    """Get budget suggestions based on historical data"""
    try:
        # Get historical data for analysis
        records = db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month.desc()).limit(6).all()
        
        if not records:
            raise HTTPException(status_code=404, detail="No historical data available for analysis")

        # Calculate average spending per category
        avg_payroll = sum(r.Payroll for r in records) / len(records)
        avg_marketing = sum(r.Marketing_Advertising for r in records) / len(records)
        avg_rd = sum(r.Research_Development for r in records) / len(records)
        avg_office = sum(r.Office_Rent_Utilities for r in records) / len(records)
        avg_logistics = sum(r.Logistics_Delivery for r in records) / len(records)
        avg_misc = sum(r.Miscellaneous for r in records) / len(records)
        
        # Return suggestions based on historical averages
        return [{
            "id": c["id"],
            "suggested": avg_payroll * (goal.goal / sum(r.Payroll for r in records))
        } for c in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executive-summary")
def get_executive_summary(db: Session = Depends(get_db)):
    """Get executive summary for the last 6 months"""
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
        
        output_path = executive_summary.generate_summary(start_date, end_date)
        return FileResponse(output_path, media_type="application/pdf", filename="executive_summary.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report/executive-summary")
async def generate_executive_summary(request: ExecutiveSummaryRequest, db: Session = Depends(get_db)):
    """Generate custom period executive summary"""
    try:
        output_path = executive_summary.generate_summary(
            request.start_date,
            request.end_date
        )
        return FileResponse(output_path, media_type="application/pdf", filename="executive_summary.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health-score-simple")
def get_health_score_simple():
    """Calculate and return only the financial health score from financial_docs.db using the provided formula"""
    try:
        # Connect to the correct database
        engine = create_engine("sqlite:///./financial_docs.db")
        # Read the table (adjust table name if needed)
        df = pd.read_sql("SELECT * FROM Monthly_Financial_Data_2025", engine)
        if df.empty:
            return {"score": 0}
        latest = df.iloc[-1]
        # Compute net profit margin
        net_profit_margin = 0.0
        if latest["Revenue"] and latest["Net_Profit"]:
            net_profit_margin = latest["Net_Profit"] / latest["Revenue"]
        # Compute cash_inflow / cash_outflow
        cash_inflow_ratio = 0.0
        if latest["Cash_Outflow"]:
            cash_inflow_ratio = latest["Cash_Inflow"] / latest["Cash_Outflow"]
        # Compute cash_on_hand / monthly_expenses
        cash_on_hand = latest["Total_Assets"] - latest["Total_Liabilities"]
        monthly_expenses = latest["Cash_Outflow"]
        cash_on_hand_ratio = 0.0
        if monthly_expenses:
            cash_on_hand_ratio = cash_on_hand / monthly_expenses
        # Apply formula
        score = (
            (net_profit_margin * 0.375) +
            (cash_inflow_ratio * 0.375) +
            (cash_on_hand_ratio * 0.25)
        )
        score = min(score * 40, 100)
        return {"score": round(score, 2)}
    except Exception as e:
        return {"score": 0, "error": str(e)}