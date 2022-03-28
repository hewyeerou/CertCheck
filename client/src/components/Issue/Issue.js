import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Popconfirm, PageHeader} from 'antd';
import PageFooter from '../PageFooter';
import PageSider from '../PageSider';
import Page from '../Page';

function Issue() {

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
            title: '',
            key: 'action',
            render: (text, record) =>
                <Popconfirm title="Are you sure to issue certificate to this student?" onConfirm={() => issueCertificate(record)} okText="Yes"
                    cancelText="No">
                    <a>Issue</a>
                </Popconfirm>
        },
        {
            title: '',
            key: 'action',
            render: (text, record) =>
                <Popconfirm title="Are you sure this student is not applicable for the request?" onConfirm={() => issueCertificate(record)} okText="Yes"
                    cancelText="No">
                    <a>Not Applicable</a>
                </Popconfirm>
        },
    ];

    const data = [
        {
            key: '1',
            name: 'John Brown',
            email: 32,
            walletAddress: 'New York No. 1 Lake Park',
            tags: ['nice', 'developer'],
        },
        {
            key: '2',
            name: 'Jim Green',
            email: 42,
            walletAddress: 'London No. 1 Lake Park',
            tags: ['loser'],
        },
        {
            key: '3',
            name: 'Joe Black',
            email: 32,
            walletAddress: 'Sidney No. 1 Lake Park',
            tags: ['cool', 'teacher'],
        },
    ];

    const issueCertificate = (record) => {
        console.log(record);
    }

    const deleteRecord = (record) => {
        console.log(record);
    }

    return (
        <>
            <Page />
            <PageHeader
                className="site-page-header"
                title="Certificate Requests"
            />
            <Table columns={columns} dataSource={data} />
            <Table columns={columns} dataSource={data} />
        </>
    );
}

export default Issue;