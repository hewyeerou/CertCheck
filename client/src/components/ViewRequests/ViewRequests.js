import React, { useState, useEffect } from 'react';
import { Table, Popconfirm, PageHeader, Modal, Form, Input, DatePicker, Button, Divider } from 'antd';
import "./ViewRequests.css";

function ViewRequests(certContract) {
    const [visible, setVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [requestData, setRequestData] = useState();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        console.log(certContract);
        setRequestData(data);
        //const retrieveRequests = certContract.methods.getReqList(currentUser.walletAddress).send({ from: currentUser.walletAddress });;
        //console.log(retrieveRequests);
    }, []);

    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };

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


    const issueCertificate = (record, x) => {
        setSelectedUser(record);
        setVisible(true);
    }

    const onIssueSubmit = (values) => {
        console.log(values);
        console.log("## Check user: ", selectedUser);
        //Do issue certificate to student
        const res = certContract.methods.issueCertificate(
            selectedUser.walletAddress, 
            currentUser.name, 
            values.studentNRIC, 
            values.studentMatric, 
            values.title, 
            values.completionDate)
            .send({ from: currentUser.walletAddress });
    }

    const deleteRequest = (record, x) => {
        console.log(x);
        data.splice(x, 1);
        console.log(data);
        setRequestData(data);
        //Delete record from contract
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

                    <Form.Item
                        label="Student Matric No."
                        name="studentMatric"
                        rules={[{ required: true, message: 'Please input student Matric No.!' }]}
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
                        label="Roll Number"
                        name="rollNumber"
                        rules={[{ required: true, message: 'Please input Roll Number!' }]}
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