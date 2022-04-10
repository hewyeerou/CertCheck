import React, { useState, useEffect } from 'react';

import { Layout } from 'antd';
import PageHeader from './PageHeader';
import ViewAllCertificates from './ViewAllCertificates';
import PageFooter from './PageFooter';
import PageSider from './PageSider';
import Request from './Request/Request';
import Invitation from './Invitation/Invitation';
import ViewRequests from './ViewRequests/ViewRequests';
import ViewCertVer from './ViewCertVer/ViewCertVer';
import ViewIssued from './ViewIssued/ViewIssued';

import { useLocation } from "react-router-dom";

const Page = ({ pageType, certStoreContract, certContract, accounts }) => {
    const [page, setPage] = useState();
    const location = useLocation();

    let user = JSON.parse(localStorage.getItem("user"));

    const { Header, Footer, Sider, Content } = Layout;

    useEffect(() => {
        if (pageType === '/student/viewCert') {
            setPage(<ViewAllCertificates certStoreContract={certStoreContract} certContract={certContract} user={user} accounts={accounts}/>);
        } else if (pageType === '/student/viewReq') {
            setPage(<Request />);
        } else if (pageType === '/student/viewVer') {
            setPage(<Invitation user={user} certStoreContract={certStoreContract} certContract={certContract} accounts={accounts}/>);
        } else if (pageType === '/verifier/viewStudentCert') {
            setPage(<ViewCertVer user={user} certStoreContract={certStoreContract} certContract={certContract} accounts={accounts}/>);
        } else if (pageType === "/issuer/viewRequests") {
            setPage(<ViewRequests certStoreContract={certStoreContract} certContract={certContract} />);
        } else if (pageType === "/issuer/viewIssued") {
            setPage(<ViewIssued certStoreContract={certStoreContract} certContract={certContract} />);
        }
    }, [location.pathname]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ backgroundColor: '#f0f8ff' }}>
                <PageHeader />
            </Header>
            <Layout>
                <Sider>
                    <PageSider/>
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
