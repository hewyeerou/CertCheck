import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Typography, Modal, Table, Form, Select, message } from 'antd';
import { getAllUsers, getUserByAddress } from "../../models/User";

const Invitation = ({ user, certContract, accounts }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRevokeModalVisible, setIsRevokeModalVisible] = useState(false);
    const [revokeVerifier, setRevokeVerifier] = useState();

    const [form] = Form.useForm();

    const [certificateViewingRight, setCertificateViewingRight] = useState();
    const [verifierList, setVerifierList] = useState();

    /* datatable columns */
    const columns = [
        { title: 'Verifier', dataIndex: 'name', key: 'key' },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button
                    onClick={() => {
                        setRevokeVerifier(text);
                        showRevokeModal();
                    }}
                >
                    Revoke
                </Button>
            ),
        },
    ];

    /* Get all verifiers and display on table */
    const getApprovedVerifiers = async() => {
        let verifiersDetail = [];
        let verifiers = await certContract.methods.getGrantList().call({ from: accounts[0] });

        
        for(let i = 0; i < verifiers.length; i++) {
            const rights = await certContract.methods.checkVerifier(verifiers[i]).call({ from: accounts[0] });

            if(rights === true) {
                await getUserByAddress(verifiers[i]).then((user) => {
                    verifiersDetail.push(user);
                });
            }
        }

        verifiersDetail = verifiersDetail.map((r, index) => ({...r, key: index+1}));
        setCertificateViewingRight(verifiersDetail);
    };

    /* get all verifiers from db */
    const getVerifiers = async() => {
        let verifiersList = [];

        //get all users from db and filter
        await getAllUsers().then((users) => {
            for(let address in users) {
                if(users[address].type === "Verifier") {
                    verifiersList.push({name: users[address].name, value: address});
                }
            }
        });
        setVerifierList(verifiersList);
    };

    useEffect(() => {
        getApprovedVerifiers();
        getVerifiers();
    },[]);

    useEffect(() => {
        getVerifiers();
    }, [verifierList]);

    useEffect(() => {
        getApprovedVerifiers();
    }, [isModalVisible, isRevokeModalVisible]);

    /* revoke verifier */
    const confirmRevoke = async() => {
        const res = await certContract.methods.denyVerifier(revokeVerifier.walletAddress).send({ from: accounts[0] });

        message.info("Revoked access rights from the verifier");

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

    const onFinish = async(values) => {
        const selectedVerifierAddr = values.verifier;

        try{
            const res = await certContract.methods.grantVerifier(selectedVerifierAddr).send({ from: accounts[0] });
            console.log("######## Response", res);

            message.info("Granted access rights to the verifier");
        } catch(err) {
            let errorMessageInJson = JSON.parse(err.message.slice(58, err.message.length - 2) );
            let errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;

            message.error(errorMessageToShow);
        }
        
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
                                {verifierList && verifierList.map((verifier) => (
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
                    {revokeVerifier && <Typography>Are you sure you want to revoke the viewing right of {revokeVerifier.name} ?</Typography>}
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
