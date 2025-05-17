import pandas as pd
import sqlite3
from datetime import datetime
from typing import Dict, Any
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.units import cm
from reportlab.graphics.shapes import Drawing, String
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.legends import Legend
from reportlab.graphics.widgets.markers import makeMarker
import io

class ExecutiveSummaryGenerator:
    def __init__(self, db_path: str, api_key: str = None):
        self.db_path = db_path
        self.api_key = api_key
        self.output_dir = "reports"
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_summary(self, start_date: str, end_date: str) -> str:
        """Generate executive summary report for the specified date range"""
        try:
            # Get financial data
            data = self._get_financial_data(start_date, end_date)
            
            # Generate report
            output_path = os.path.join(self.output_dir, f"executive_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
            self._create_pdf_report(data, output_path)
            
            return output_path
        except Exception as e:
            raise Exception(f"Error generating executive summary: {str(e)}")

    def _get_financial_data(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Get financial data for the specified date range"""
        conn = sqlite3.connect(self.db_path)
        query = """
        SELECT * FROM Monthly_Financial_Data_2025 
        WHERE Report_Month BETWEEN ? AND ?
        ORDER BY Report_Month
        """
        df = pd.read_sql_query(query, conn, params=(start_date, end_date))
        conn.close()

        if df.empty:
            raise Exception("No data available for the specified date range")

        # Calculate key metrics
        latest = df.iloc[-1]
        previous = df.iloc[-2] if len(df) > 1 else latest

        revenue_change = (latest["Revenue"] - previous["Revenue"]) / previous["Revenue"] if previous["Revenue"] != 0 else 0
        expenses_change = (latest["Cash_Outflow"] - previous["Cash_Outflow"]) / previous["Cash_Outflow"] if previous["Cash_Outflow"] != 0 else 0
        profit = latest["Revenue"] - latest["Cash_Outflow"]
        profit_change = ((latest["Revenue"] - latest["Cash_Outflow"]) - 
                        (previous["Revenue"] - previous["Cash_Outflow"])) / (previous["Revenue"] - previous["Cash_Outflow"]) if (previous["Revenue"] - previous["Cash_Outflow"]) != 0 else 0

        return {
            "period": {
                "start": start_date,
                "end": end_date
            },
            "metrics": {
                "revenue": {
                    "current": latest["Revenue"],
                    "change": revenue_change
                },
                "expenses": {
                    "current": latest["Cash_Outflow"],
                    "change": expenses_change
                },
                "profit": {
                    "current": profit,
                    "change": profit_change
                }
            },
            "trends": {
                "revenue": df["Revenue"].tolist(),
                "expenses": df["Cash_Outflow"].tolist(),
                "dates": df["Report_Month"].tolist()
            }
        }

    def _create_pdf_report(self, data: Dict[str, Any], output_path: str):
        """Create PDF report with the financial data"""
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # --- Header Bar with Title and Logo Placeholder ---
        header_style = ParagraphStyle(
            'HeaderBar',
            parent=styles['Heading1'],
            fontSize=26,
            textColor=colors.whitesmoke,
            alignment=1,
            spaceAfter=0,
            spaceBefore=0,
            backColor=colors.HexColor('#2E3B55'),
            leading=32,
            borderPadding=(10, 10, 10, 10)
        )
        story.append(Paragraph("<b>Executive Summary Report</b>", header_style))
        # Logo placeholder (right side)
        story.append(Spacer(1, 8))

        # --- Period ---
        period_style = ParagraphStyle('Period', parent=styles['Normal'], fontSize=12, spaceAfter=12)
        story.append(Paragraph(f"<b>Period:</b> {data['period']['start']} to {data['period']['end']}", period_style))
        story.append(Spacer(1, 10))

        # --- Highlights Section ---
        highlights = []
        # Best/worst months
        dates = data['trends']['dates']
        revenues = data['trends']['revenue']
        expenses = data['trends']['expenses']
        if revenues and expenses and dates:
            best_month_idx = revenues.index(max(revenues))
            worst_month_idx = revenues.index(min(revenues))
            best_month = dates[best_month_idx]
            worst_month = dates[worst_month_idx]
            highlights.append(f"Highest revenue: <b>{best_month}</b> (${max(revenues):,.2f})")
            highlights.append(f"Lowest revenue: <b>{worst_month}</b> (${min(revenues):,.2f})")
            # Largest expense
            max_exp_idx = expenses.index(max(expenses))
            highlights.append(f"Highest expenses: <b>{dates[max_exp_idx]}</b> (${max(expenses):,.2f})")
            # Largest change
            if len(revenues) > 1:
                changes = [revenues[i] - revenues[i-1] for i in range(1, len(revenues))]
                max_change = max(changes, key=abs)
                max_change_idx = changes.index(max_change) + 1
                highlights.append(f"Largest revenue change: <b>{dates[max_change_idx]}</b> ({'+' if max_change > 0 else ''}{max_change:,.2f})")
        if highlights:
            story.append(Paragraph("<b>Highlights</b>", styles["Heading2"]))
            story.append(Spacer(1, 6))
            for hl in highlights:
                story.append(Paragraph(f"• {hl}", styles["Normal"]))
            story.append(Spacer(1, 14))

        # --- Line Chart for Revenue and Expenses ---
        if len(dates) > 1:
            drawing = Drawing(400, 180)
            lp = LinePlot()
            lp.x = 50
            lp.y = 40
            lp.height = 100
            lp.width = 300
            # X axis: evenly spaced, label with months
            lp.data = [
                list(enumerate(revenues)),
                list(enumerate(expenses))
            ]
            lp.lines[0].strokeColor = colors.HexColor('#4F8EF7')
            lp.lines[0].symbol = makeMarker('Circle')
            lp.lines[1].strokeColor = colors.HexColor('#FF5252')
            lp.lines[1].symbol = makeMarker('Square')
            lp.xValueAxis.valueMin = 0
            lp.xValueAxis.valueMax = len(dates) - 1
            lp.xValueAxis.valueSteps = list(range(len(dates)))
            lp.xValueAxis.labelTextFormat = lambda idx: dates[idx][:7] if idx < len(dates) else ''
            lp.yValueAxis.valueMin = min(min(revenues), min(expenses)) * 0.95
            lp.yValueAxis.valueMax = max(max(revenues), max(expenses)) * 1.05
            lp.yValueAxis.valueSteps = None
            drawing.add(lp)
            # Legend
            legend = Legend()
            legend.x = 320
            legend.y = 140
            legend.colorNamePairs = [
                (colors.HexColor('#4F8EF7'), 'Revenue'),
                (colors.HexColor('#FF5252'), 'Expenses')
            ]
            drawing.add(legend)
            story.append(drawing)
            story.append(Spacer(1, 18))

        # --- Key Metrics Table ---
        story.append(Paragraph("<b>Key Financial Metrics</b>", styles["Heading2"]))
        story.append(Spacer(1, 12))
        metrics_data = [
            ["Metric", "Current Value", "Change"],
            ["Revenue", f"${data['metrics']['revenue']['current']:,.2f}", f"{data['metrics']['revenue']['change']*100:,.1f}%"],
            ["Expenses", f"${data['metrics']['expenses']['current']:,.2f}", f"{data['metrics']['expenses']['change']*100:,.1f}%"],
            ["Profit", f"${data['metrics']['profit']['current']:,.2f}", f"{data['metrics']['profit']['change']*100:,.1f}%"]
        ]
        metrics_table = Table(metrics_data, colWidths=[2*inch, 2*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E3B55')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.beige])
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 20))

        # --- Summary Section ---
        summary_box_style = ParagraphStyle(
            'SummaryBox',
            parent=styles['Normal'],
            fontSize=12,
            backColor=colors.HexColor('#F5F7FA'),
            borderPadding=(8, 8, 8, 8),
            spaceAfter=12,
            leading=16
        )
        story.append(Paragraph("<b>Summary</b>", styles["Heading2"]))
        story.append(Spacer(1, 12))
        summary_text = f"""
        During the period from {data['period']['start']} to {data['period']['end']}, the company showed \
        {'positive' if data['metrics']['revenue']['change'] > 0 else 'negative'} revenue growth of \
        {abs(data['metrics']['revenue']['change']*100):,.1f}%. Expenses {'increased' if data['metrics']['expenses']['change'] > 0 else 'decreased'} by \
        {abs(data['metrics']['expenses']['change']*100):,.1f}%, resulting in a {'profit' if data['metrics']['profit']['current'] > 0 else 'loss'} of \
        ${abs(data['metrics']['profit']['current']):,.2f}.
        """
        story.append(Paragraph(summary_text, summary_box_style))
        story.append(Spacer(1, 18))

        # --- Footer with Generation Date ---
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=2,
            spaceBefore=20
        )
        story.append(Paragraph(f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))

        # --- (Optional) Watermark or background logo ---
        # (Not implemented here for simplicity, but can be added with canvas if needed)

        # Build PDF
        doc.build(story) 