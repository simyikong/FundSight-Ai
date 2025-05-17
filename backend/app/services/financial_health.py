import pandas as pd
import numpy as np
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.financial import MonthlyFinancialData

class FinancialHealthAnalyzer:
    def __init__(self, db: Session):
        self.db = db

    def get_financial_health_score(self) -> Dict[str, Any]:
        """Calculate overall financial health score and component scores"""
        try:
            # Get last 6 months of data using SQLAlchemy
            records = self.db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month.desc()).limit(6).all()
            
            if not records:
                return {
                    "overall_score": 0,
                    "components": {
                        "liquidity": {"score": 0, "details": "No data available"},
                        "debt": {"score": 0, "details": "No data available"},
                        "profitability": {"score": 0, "details": "No data available"},
                        "trend": {"score": 0, "details": "No data available"}
                    }
                }

            # Convert to DataFrame for easier analysis
            df = pd.DataFrame([{
                'Report_Month': r.Report_Month,
                'Revenue': r.Revenue,
                'Net_Profit': r.Net_Profit,
                'Cash_Inflow': r.Cash_Inflow,
                'Cash_Outflow': r.Cash_Outflow,
                'Total_Assets': r.Total_Assets,
                'Total_Liabilities': r.Total_Liabilities,
                'Equity': r.Equity,
                'Profit_Margin': r.Profit_Margin,
                'Revenue_Growth_MoM': r.Revenue_Growth_MoM
            } for r in records])

            # Calculate component scores
            liquidity_score = self._calculate_liquidity_score(df)
            debt_score = self._calculate_debt_score(df)
            profitability_score = self._calculate_profitability_score(df)
            trend_score = self._calculate_trend_score(df)

            # Calculate overall score (weighted average)
            overall_score = (
                liquidity_score["score"] * 0.3 +
                debt_score["score"] * 0.2 +
                profitability_score["score"] * 0.3 +
                trend_score["score"] * 0.2
            )

            return {
                "overall_score": round(overall_score, 2),
                "components": {
                    "liquidity": liquidity_score,
                    "debt": debt_score,
                    "profitability": profitability_score,
                    "trend": trend_score
                }
            }
        except Exception as e:
            raise Exception(f"Error calculating financial health score: {str(e)}")

    def get_revenue_expenses_forecast(self) -> Dict[str, Any]:
        """Get revenue and expenses data with forecasting"""
        try:
            # Get all records ordered by date using SQLAlchemy
            records = self.db.query(MonthlyFinancialData).order_by(MonthlyFinancialData.Report_Month).all()
            
            if not records:
                return {"historical": [], "forecast": []}

            # Convert to DataFrame
            df = pd.DataFrame([{
                'Report_Month': r.Report_Month,
                'Revenue': r.Revenue,
                'Net_Profit': r.Net_Profit,
                'Cash_Inflow': r.Cash_Inflow,
                'Cash_Outflow': r.Cash_Outflow
            } for r in records])

            # Prepare historical data
            historical = {
                "dates": df["Report_Month"].dt.strftime("%Y-%m-%d").tolist(),
                "revenue": df["Revenue"].tolist(),
                "profit": df["Net_Profit"].tolist(),
                "cash_inflow": df["Cash_Inflow"].tolist(),
                "cash_outflow": df["Cash_Outflow"].tolist()
            }

            # Simple forecasting (using moving average)
            forecast_months = 3
            revenue_forecast = self._simple_forecast(df["Revenue"], forecast_months)
            profit_forecast = self._simple_forecast(df["Net_Profit"], forecast_months)
            cash_inflow_forecast = self._simple_forecast(df["Cash_Inflow"], forecast_months)
            cash_outflow_forecast = self._simple_forecast(df["Cash_Outflow"], forecast_months)

            # Generate future dates
            last_date = df["Report_Month"].iloc[-1]
            future_dates = [(last_date + pd.DateOffset(months=i+1)).strftime("%Y-%m-%d") 
                          for i in range(forecast_months)]

            forecast = {
                "dates": future_dates,
                "revenue": revenue_forecast,
                "profit": profit_forecast,
                "cash_inflow": cash_inflow_forecast,
                "cash_outflow": cash_outflow_forecast
            }

            return {
                "historical": historical,
                "forecast": forecast
            }
        except Exception as e:
            raise Exception(f"Error generating forecast: {str(e)}")

    def _calculate_liquidity_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate liquidity score based on cash flow metrics"""
        latest = df.iloc[0]
        cash_flow = latest["Cash_Inflow"] - latest["Cash_Outflow"]
        cash_ratio = cash_flow / latest["Cash_Outflow"] if latest["Cash_Outflow"] != 0 else 0
        
        score = min(100, max(0, (cash_ratio + 1) * 50))  # Scale to 0-100
        
        return {
            "score": round(score, 2),
            "details": f"Cash flow ratio: {cash_ratio:.2f}"
        }

    def _calculate_debt_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate debt score based on debt metrics"""
        latest = df.iloc[0]
        debt_ratio = latest["Total_Liabilities"] / latest["Total_Assets"] if latest["Total_Assets"] != 0 else 0
        
        score = min(100, max(0, (1 - debt_ratio) * 100))  # Scale to 0-100
        
        return {
            "score": round(score, 2),
            "details": f"Debt ratio: {debt_ratio:.2f}"
        }

    def _calculate_profitability_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate profitability score based on profit metrics"""
        latest = df.iloc[0]
        profit_margin = latest["Profit_Margin"] / 100  # Convert from percentage
        
        score = min(100, max(0, (profit_margin + 0.2) * 250))  # Scale to 0-100
        
        return {
            "score": round(score, 2),
            "details": f"Profit margin: {latest['Profit_Margin']:.1f}%"
        }

    def _calculate_trend_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate trend score based on growth metrics"""
        if len(df) < 2:
            return {"score": 50, "details": "Insufficient data for trend analysis"}
            
        latest = df.iloc[0]
        revenue_growth = latest["Revenue_Growth_MoM"] / 100  # Convert from percentage
        
        score = min(100, max(0, (revenue_growth + 0.2) * 250))  # Scale to 0-100
        
        return {
            "score": round(score, 2),
            "details": f"Revenue growth MoM: {latest['Revenue_Growth_MoM']:.1f}%"
        }

    def _simple_forecast(self, series: pd.Series, periods: int) -> list:
        """Generate simple forecast using moving average"""
        if len(series) < 3:
            return [series.mean()] * periods
            
        # Use 3-month moving average
        ma = series.rolling(window=3).mean().iloc[-1]
        trend = (series.iloc[-1] - series.iloc[-3]) / 2
        
        forecast = []
        for i in range(periods):
            forecast.append(ma + trend * (i + 1))
            
        return [round(x, 2) for x in forecast] 