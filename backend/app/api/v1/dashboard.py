from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
import subprocess
from datetime import datetime

router = APIRouter()

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

# In-memory storage for budget categories (replace with a database in production)
budget_categories = []

@router.get("/metrics", response_model=List[Metric])
def get_metrics():
    # TODO: Replace with real DB/AI logic
    return [
        {"title": "Monthly Revenue", "value": 25000, "change": 12.5, "color": "#2196F3"},
        {"title": "Monthly Expenses", "value": 18500, "change": -2.1, "color": "#FF9800"},
        {"title": "Cash Balance", "value": 45000, "change": 8.4, "color": "#9C27B0"},
        {
            "title": "Financial Health Score",
            "value": 85,
            "change": 5,
            "color": "#4CAF50",
            "tooltip": "Based on liquidity, debt-to-income, profitability, etc."
        }
    ]

@router.get("/chart-data")
def get_chart_data():
    # TODO: Add forecasting logic (Prophet/PAI)
    return {
        "revenue": [25000, 28000, 30000, 32000, 35000, 38000],
        "expenses": [18500, 19000, 19500, 20000, 21000, 22000],
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    }

@router.get("/budget-categories", response_model=List[BudgetCategory])
def get_budget_categories():
    # TODO: Fetch from DB
    return budget_categories

@router.post("/budget-suggestions")
def get_budget_suggestions(goal: float, categories: List[Dict]):
    # TODO: Use Qwen LLM or other AI for suggestions
    # Example: Evenly distribute goal
    per_cat = goal / len(categories)
    return [{"id": c["id"], "suggested": per_cat} for c in categories]

@router.get("/executive-summary")
def get_executive_summary():
    # TODO: Use Qwen LLM to generate summary
    return {
        "summary": "Your business is on track. Revenue is growing, expenses are stable...",
        "insights": [
            "Increase marketing spend for higher growth.",
            "Optimize operations for better margins."
        ]
    }

@router.get("/api/metrics/summary")
async def get_metrics_summary():
    # TODO: Replace with actual DB queries and AI/ML calls
    # For now, return mock data
    return {
        "revenue": 10000,
        "expenses": 8000,
        "cash": 20000,
        "healthScore": 85,
        "suggestions": ["Increase liquidity", "Reduce debt"]
    }

@router.get("/api/metrics/revenue-expenses")
async def get_revenue_expenses(period: str = "monthly"):
    # TODO: Integrate PAI Prophet for forecasting
    # For now, return mock data
    return {
        "historical": [
            {"date": "2023-01", "revenue": 9000, "expenses": 7000},
            {"date": "2023-02", "revenue": 9500, "expenses": 7500},
            {"date": "2023-03", "revenue": 10000, "expenses": 8000}
        ],
        "forecast": [
            {"date": "2023-04", "revenue": 10500, "expenses": 8500},
            {"date": "2023-05", "revenue": 11000, "expenses": 9000}
        ]
    }

@router.post("/api/budget/categories", response_model=BudgetCategory)
async def add_budget_category(category: BudgetCategory):
    budget_categories.append(category)
    return category

@router.put("/api/budget/categories/{category_id}", response_model=BudgetCategory)
async def update_budget_category(category_id: int, category: BudgetCategory):
    if category_id < 0 or category_id >= len(budget_categories):
        raise HTTPException(status_code=404, detail="Category not found")
    budget_categories[category_id] = category
    return category

@router.delete("/api/budget/categories/{category_id}")
async def delete_budget_category(category_id: int):
    if category_id < 0 or category_id >= len(budget_categories):
        raise HTTPException(status_code=404, detail="Category not found")
    budget_categories.pop(category_id)
    return {"message": "Category deleted"}

@router.post("/api/budget/ai-suggestions")
async def get_ai_suggestions(goal: BudgetGoal):
    # TODO: Integrate Qwen LLM for AI suggestions
    # For now, return mock suggestions
    return {
        "suggestions": [
            {"category": "Payroll", "suggestion": "Increase by 10%"},
            {"category": "Marketing", "suggestion": "Decrease by 5%"}
        ]
    }

@router.post("/api/report/executive-summary")
async def generate_executive_summary(request: ExecutiveSummaryRequest):
    # TODO: Integrate Qwen LLM for AI insights and PDF generation
    # For now, return a mock PDF file
    pdf_path = "executive_summary.pdf"
    # Simulate PDF generation (replace with actual PDF generation logic)
    with open(pdf_path, "w") as f:
        f.write("Executive Summary Report\n")
        f.write(f"Period: {request.start_date} to {request.end_date}\n")
        f.write("AI-generated insights: ...\n")
    return FileResponse(pdf_path, media_type="application/pdf", filename="executive_summary.pdf")