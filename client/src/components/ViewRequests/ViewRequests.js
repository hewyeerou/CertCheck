import React, { useState, useEffect } from 'react';
import { Table, Popconfirm, PageHeader, Modal, Form, Input, DatePicker, Button, Divider } from 'antd';
import "./ViewRequests.css";
import { getUserByAddress } from "../../models/User";

function ViewRequests({ certStoreContract, certContract}) {
    const [visible, setVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [requestData, setRequestData] = useState();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        console.log(certContract);
        retrieveRequest();
    }, []);

    const retrieveRequest = async () => {
        const retrieveReq = await certStoreContract.methods.getApprovedReqList().call({from: currentUser.walletAddress});
       console.log(retrieveReq);
       var tempArr = [];
       for(var i = 0; i < retrieveReq.length; i ++) {
        // const checkReq = await certContract.methods.checkRequest(retrieveReq[i]).call({from: currentUser.walletAddress});
        // console.log(checkReq);
            await getUserByAddress(retrieveReq[i]).then((u) => {
             if(u != false) {
                 tempArr.push(u);
                }
            })
       }
       var requestDetail = tempArr.map((r, index) => ({...r, key: index+1}));
       console.log(requestDetail);
       setRequestData(requestDetail);
    }

    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };

    const columns = [
        {
            title: '',
            dataIndex: 'key',
            key: 'key'
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
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
            render: (text, record, x) =>
                <Popconfirm title="Are you sure to issue certificate to this student?" onConfirm={() => issueCertificate(record, x)} okText="Yes"
                    cancelText="No">
                    <a>Issue</a>
                </Popconfirm>
        },
        {
            title: '',
            key: 'action',
            render: (text, record, x) =>
                <Popconfirm title="Are there no certificates applicable for this student?" onConfirm={() => deleteRequest(record, x)} okText="Yes"
                    cancelText="No">
                    <a>Not Applicable</a>
                </Popconfirm>
        },
    ];

    const issueCertificate = (record, x) => {
        setSelectedUser(record);
        setVisible(true);
    }

    const onIssueSubmit = async (values) => {
        console.log(values);
        console.log("## Check user: ", selectedUser);
        //Do issue certificate to student
        const res = await certContract.methods.issueCertificate(
            selectedUser.walletAddress, 
            currentUser.name, 
            values.studentNRIC, 
            values.serialNo, 
            values.title, 
            values.completionDate.format('DD-MM-YYYY').toString()
            ).send({ from: currentUser.walletAddress });
        setVisible(false);
    }

    const deleteRequest = async (record, x) => {
        console.log(record.walletAddress);
        console.log(currentUser.walletAddress);
        const retrieveIss = await certStoreContract.methods.rejectRequest(record.walletAddress).send({from: currentUser.walletAddress});
        retrieveRequest();
    }

    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Certificate Requests"
            />
            <Table columns={columns} dataSource={requestData} />
            <Modal
                title="Issue Certificate"
                centered
                visible={visible}
                onCancel={() => setVisible(false)}
                width={1000}
                footer={[

                ]}
            >
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onIssueSubmit}
                    autoComplete="off"
                >
                    <PageHeader
                        className="form-sub-header"
                        title="Student Information"
                    />
                    <Form.Item
                        label="Student Name"
                        name="studentName"
                        rules={[{ required: true, message: 'Please input student name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Student NRIC"
                        name="studentNRIC"
                        rules={[{ required: true, message: 'Please input student NRIC!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <PageHeader
                        className="form-sub-header"
                        title="Certificate Information"
                    />
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input certificate title!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Completion Date"
                        name="completionDate"
                        rules={[{ required: true, message: 'Please input completion date!' }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        label="Serial Number"
                        name="serialNo"
                        rules={[{ required: true, message: 'Please input Serial Number!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button htmlType="submit" type="primary">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default ViewRequests;