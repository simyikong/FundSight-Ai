from sqlalchemy import Column, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class MonthlyFinancialData(Base):
    __tablename__ = "Monthly_Financial_Data_2025"

    Report_Month = Column(String, primary_key=True)
    Revenue = Column(Float)  # Revenue (RM)
    Net_Profit = Column(Float)  # Net Profit (RM)
    Cash_Inflow = Column(Float)  # Cash Inflow (RM)
    Cash_Outflow = Column(Float)  # Cash Outflow (RM)
    Total_Assets = Column(Float)  # Total Assets (RM)
    Total_Liabilities = Column(Float)  # Total Liabilities (RM)
    Equity = Column(Float)  # Equity (RM)
    Payroll = Column(Float)  # Payroll (RM)
    Marketing_Advertising = Column(Float)  # Marketing & Advertising (RM)
    Research_Development = Column(Float)  # Research & Development (RM)
    Office_Rent_Utilities = Column(Float)  # Office Rent & Utilities (RM)
    Logistics_Delivery = Column(Float)  # Logistics & Delivery (RM)
    Miscellaneous = Column(Float)  # Miscellaneous (RM)
    Burn_Rate = Column(Float)  # Burn Rate (RM)
    Cash_Runway = Column(Float)  # Cash Runway (months)
    Profit_Margin = Column(Float)  # Profit Margin (%)
    Revenue_Growth_MoM = Column(Float)  # Revenue Growth MoM (%)
    CAC = Column(Float)  # CAC (RM)
    MRR = Column(Float)  # MRR (RM) 