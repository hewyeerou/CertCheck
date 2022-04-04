import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Popconfirm, PageHeader} from 'antd';
import PageFooter from '../PageFooter';
import PageSider from '../PageSider';
import Page from '../Page';

function ViewIssued() {

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <a>{text}</a>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Wallet Address',
            dataIndex: 'walletAddress',
            key: 'walletAddress',
        },
        {
            title: 'Certificate Title',
            dataIndex: 'certificateTitle',
            key: 'certificateTitle',
        },
        {
            title: 'Roll Number',
            dataIndex: 'rollNumber',
            key: 'rollNumber',
        },
        {
            title: '',
            key: 'action',
            render: (text, record, x) =>
                <Popconfirm title="Do you want to revoke this certificate?" onConfirm={() => revokeCertificate(record, x)} okText="Yes"
                    cancelText="No">
                    <a>Revoke</a>
                </Popconfirm>
        },
    ];

    const data = [
        {
            certId: '1',
            name: 'John Brown',
            email: 32,
            walletAddress: 'New York No. 1 Lake Park',
            rollNumber: "123123",
            certificateTitle: "Degree"
        },
        {
            certId: '2',
            name: 'Jim Green',
            email: 42,
            walletAddress: 'London No. 1 Lake Park',
            rollNumber: "123123",
            certificateTitle: "Masters"
        },
        {
            certId: '3',
            name: 'Joe Black',
            email: 32,
            walletAddress: 'Sidney No. 1 Lake Park',
            rollNumber: "123123",
            certificateTitle: "Degree"
        },
    ];

    const revokeCertificate = (record, x) => {
        console.log(record + " " + x);
        //Do revokeCert method
    }

    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Issued Certificates"
            />
            <Table columns={columns} dataSource={data} />
        </>
    );
}

export default ViewIssued;