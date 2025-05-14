import React from 'react';
import Layout from '../components/Layout';
import { ProfileApplyForm } from '../components/ProfileApply';

const Profile_Apply: React.FC = () => (
  <Layout
    title="Company Profile & Funding"
    subtitle="Complete your company profile, upload documents, and get personalized funding recommendations"
  >
    <ProfileApplyForm />
  </Layout>
);

export default Profile_Apply; 