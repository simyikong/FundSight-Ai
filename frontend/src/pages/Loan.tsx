import React from 'react';
import Layout from '../components/Layout';
import LoanForm from '../components/Loan/LoanForm';

const Loan: React.FC = () => (
  <Layout
    title="Loan Recommendations"
    subtitle="Fill in your details below to get personalized loan options and eligibility information"
  >
    <LoanForm />
  </Layout>
);

export default Loan;