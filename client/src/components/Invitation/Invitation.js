import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Typography, Modal, Table, Form, Select } from 'antd';

const Invitation = ({ certContract, accounts }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRevokeModalVisible, setIsRevokeModalVisible] = useState(false);
    const [verifier, setVerifier] = useState();
    const [revoke, setRevoke] = useState(false);
    const [revokeVerifier, setRevokeVerifier] = useState();

    const [form] = Form.useForm();

    const [certificateViewingRight, setCertificateViewingRight] = useState();

    const getVerifiers = async() => {
        let verifiers = await certContract.methods.getGrantList().call({ from: accounts[0] })
        verifiers = verifiers.map((r, index) => ({...r, key: index+1}));

        setCertificateViewingRight(verifiers);
    };

    useEffect(() => {
        console.log(certContract);
        getVerifiers();
    },[]);
    // const certificateViewingRight = [
    //     {
    //         key: 1,
    //         verifier: 'DBS',
    //     },
    //     {
    //         key: 2,
    //         verifier: 'CitiBank',
    //     },
    //     {
    //         key: 3,
    //         verifier: 'UOB',
    //     },
    //     {
    //         key: 4,
    //         verifier: 'Inknoe',
    //     },
    //     { key: 5, verifier: 'GIC', },
    //     {
    //         key: 6,
    //         verifier: 'NUH',
    //     },
    // ];

    const verifierList = [
        { name: 'Singapore Airlines', value: 'Singapore Airlines' },
        { name: 'The Development Bank of Singapore Limited (DBS)', value: 'DBS' },
        { name: 'United Overseas Bank Limited (UOB)', value: 'UOB' },
        { name: 'Google', value: 'Google' },
        { name: 'Shopee', value: 'Shopee' },
        { name: 'Amazon', value: 'Amazon' },
        { name: 'Government of Singapore Investment Corporation (GIC)', value: 'GIC' },
        { name: 'Ninja Van', value: 'Ninja Van' },
        { name: 'Tik Tok', value: 'Tik Tok' },
        { name: 'Asus', value: 'Asus' },
        { name: 'Dyson', value: 'Dyson' },
    ];

    const columns = [
        { title: 'Verifier', dataIndex: 'verifier', key: 'key' },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button
                    onClick={() => {
                        setRevokeVerifier(text.verifier);
                        showRevokeModal();
                        console.log(text);
                    }}
                >
                    Revoke
                </Button>
            ),
        },
    ];

    const confirmRevoke = () => {
        setRevoke(true);
        setIsRevokeModalVisible(false);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const showRevokeModal = () => {
        setIsRevokeModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleRevokeOk = () => {
        setIsRevokeModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleRevokeCancel = () => {
        setIsRevokeModalVisible(false);
    };

    const onFinish = (values) => {
        console.log('onFinish', values);
        setVerifier(values);
        setIsModalVisible(false);
    };

    const onReset = () => {
        form.resetFields();
    };

    return (
        <>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Typography.Title level={2} style={{ paddingLeft: 20, paddingTop: 20 }}>
                        Certificate Viewing Right
                    </Typography.Title>
                </Col>
                <Col style={{ paddingRight: 20 }}>
                    <Button type='primary' onClick={showModal}>
                        + Invite Verifier
                    </Button>{' '}
                </Col>
                <Modal
                    title='New Invitation'
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form form={form} onFinish={onFinish}>
                        <Form.Item name='verifier' label='Verifier' rules={[{ required: true }]}>
                            <Select placeholder='Select a verifier' allowClear>
                                {verifierList.map((verifier) => (
                                    <Select.Option value={verifier.value}>{verifier.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type='primary' htmlType='submit'>
                                Submit
                            </Button>
                            <Button htmlType='button' onClick={onReset}>
                                Reset
                            </Button>
                            {/* <Button type='link' htmlType='button' onClick={onFill}>
                                Fill form
                            </Button> */}
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title='Revoke Viewing Right'
                    visible={isRevokeModalVisible}
                    onOk={handleRevokeOk}
                    onCancel={handleRevokeCancel}
                    footer={null}
                >
                    <Typography>Are you sure you want to revoke the viewing right of {revokeVerifier} ?</Typography>
                    <Button type='primary' onClick={confirmRevoke}>
                        Revoke
                    </Button>
                </Modal>
            </Row>

            <Table columns={columns} dataSource={certificateViewingRight}></Table>
        </>
    );
};

export default Invitation;
