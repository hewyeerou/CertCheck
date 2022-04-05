import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Popconfirm, PageHeader} from 'antd';
import { getUserByAddress } from "../../models/User";

function ViewIssued({certContract}) {
    const [issuedData, setIssuedData] = useState();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        console.log(certContract);
        retrieveIssued();
    }, []);

    const retrieveIssued = async () => {
        const retrieveIss = await certContract.methods.getCertListIssuers().call({from: currentUser.walletAddress});
        const tempArr = [];
        for(var i = 0; i < retrieveIss.length; i ++) {
            await getUserByAddress(retrieveIss[i].owner).then((u) => {
                if(u != false) {
                    tempArr.push({
                        certId: retrieveIss[i].certId,
                        completionDate: retrieveIss[i].completionDate, 
                        name: u.name, 
                        email: u.email,
                        creationDate: retrieveIss[i].creationDate,
                        nric: retrieveIss[i].nric,
                        walletAddress: retrieveIss[i].owner,
                        title: retrieveIss[i].title,
                        serialNo: retrieveIss[i].serialNo
                     });
                   }
               });
        }
        setIssuedData(tempArr);
        console.log(tempArr);
    }

    const columns = [
        {
            title: '',
            dataIndex: 'key',
            key: 'key'
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Serial Number',
            dataIndex: 'serialNo',
            key: 'serialNo',
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

    const revokeCertificate = async (record, x) => {
        console.log(record);
        //Do revokeCert method
        const retrieveIss = await certContract.methods.revokeCert(record.certId).send({from: currentUser.walletAddress});
        retrieveIssued();
    }

    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Issued Certificates"
            />
            <Table columns={columns} dataSource={issuedData} />
        </>
    );
}

export default ViewIssued;