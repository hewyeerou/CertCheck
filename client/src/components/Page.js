import React, { useState, useEffect } from 'react';

import { Layout } from 'antd';
import PageHeader from './PageHeader';
import ViewAllCertificates from './ViewAllCertificates';
import PageFooter from './PageFooter';
import PageSider from './PageSider';
import Request from './Request/Request';
import Invitation from './Invitation/Invitation';

const Page = ({ pageType }) => {
    const [page, setPage] = useState();

    const { Header, Footer, Sider, Content } = Layout;
    const certificates = [
        {
            name: 'Puah Jia Qi',
            nric: 'G1788294R',
            matricNo: 'A0185811A',
            title: 'Bachelor’s Degree in Information Systems',
            rollNumber: '123ggtsds8hd',
            completionDate: '20/6/2022',
            issuerName: 'National University of Singapore',
        },
        {
            name: 'Puah Jia Qi',
            nric: 'G1788294R',
            matricNo: 'A0185811A',
            title: 'Bachelor’s Degree in Information Systems',
            rollNumber: '123ggtsds8hd',
            completionDate: '20/6/2022',
            issuerName: 'National University of Singapore',
        },
        {
            name: 'Puah Jia Qi',
            nric: 'G1788294R',
            matricNo: 'A0185811A',
            title: 'Diploma in Computer Engineering',
            rollNumber: '12dhdwedied8j32',
            completionDate: '20/6/2017',
            issuerName: 'Singapore Polytechnic',
        },
        {
            name: 'Puah Jia Qi',
            nric: 'G1788294R',
            matricNo: 'A0185811A',
            title: 'Master of Business Administration',
            rollNumber: 'cndjk123kbhjqw',
            completionDate: '20/6/2026',
            issuerName: 'Nanyang Technological Unversity',
        },
    ];

    useEffect(() => {
        if (pageType === 'viewCert') {
            setPage(<ViewAllCertificates certificates={certificates} />);
        } else if (pageType === 'viewReq') {
            setPage(<Request />);
        } else if (pageType === 'viewVer') {
            setPage(<Invitation />);
        }
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ backgroundColor: '#f0f8ff' }}>
                <PageHeader />
            </Header>
            <Layout>
                <Sider>
                    <PageSider />
                </Sider>
                <Content>{page}</Content>
            </Layout>
            <Footer style={{ backgroundColor: '#f0f8ff' }}>
                <PageFooter />
            </Footer>
        </Layout>
    );
};

export default Page;
