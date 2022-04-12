import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Popconfirm, PageHeader} from 'antd';
import { getUserByAddress } from "../../models/User";

function ViewIssued({ certStoreContract, certContract}) {
    const [issuedData, setIssuedData] = useState();
    const [revokedData, setRevokedData] = useState();    

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        console.log(certContract);
        retrieveIssued();
    }, []);

    const retrieveIssued = async () => {
        const retrieveIss = await certContract.methods.getCerts().call({from: currentUser.walletAddress});
        const retrieveRevoked = await certContract.methods.getCertsRevokedList().call({from: currentUser.walletAddress});
        const tempArr = [];
        const tempArrRevoked = [];
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

        for(var i = 0; i < retrieveRevoked.length; i ++) {
            await getUserByAddress(retrieveRevoked[i].owner).then((u) => {
                if(u != false) {
                    tempArrRevoked.push({
                        certId: retrieveRevoked[i].certId,
                        completionDate: retrieveRevoked[i].completionDate, 
                        name: u.name, 
                        email: u.email,
                        creationDate: retrieveRevoked[i].creationDate,
                        nric: retrieveRevoked[i].nric,
                        walletAddress: retrieveRevoked[i].owner,
                        title: retrieveRevoked[i].title,
                        serialNo: retrieveRevoked[i].serialNo
                     });
                   }
               });
        }
        setIssuedData(tempArr);
        setRevokedData(tempArrRevoked)
        console.log(retrieveRevoked);
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

    const columnsRevoked = [
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

            <PageHeader
                className="site-page-header"
                title="Revoked Certificates"
            />
            <Table columns={columnsRevoked} dataSource={revokedData} />
        </>
    );
}

export default ViewIssued;