import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  Table,
  Tag,
  Form,
  Select,
  message
} from "antd";
import PageHeader from "../PageHeader";
import PageFooter from "../PageFooter";
import PageSider from "../PageSider";
import { getAllUsers, getUserByAddress } from "../../models/User";


const CertificateRequest = ({ certStoreContract, certContract, user,accounts }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [issuer, setIssuer] = useState([]);
  const { Header, Footer, Sider, Content } = Layout;
  const [requestList, setRequestList] = useState();
  const [certificateReq, setCertificateReq] = useState([]);

  const [form] = Form.useForm();

  useEffect(()=>{
    getIssuer();
    getRequestList();
  },[])

  useEffect(() => {
    getRequestList();
  }, [isModalVisible]);

  const onFinish = async (values) => {
    const selectedIssuerAddress = values.institution;

    try{
          const res = await certStoreContract.methods.requestCert(selectedIssuerAddress).send({ from: accounts[0] });
      console.log("######## Response", res);
      message.info("Request has sent to issuer!");
    } catch(err) {
      let errorMessageInJson = JSON.parse(err.message.slice(58, err.message.length - 2) );
      let errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;

      message.error(errorMessageToShow);
    }
    setIsModalVisible(false);
    form.resetFields();

  };

  const getIssuer = async () =>{
    let issuersList = [];
    await getAllUsers().then(users=>{
      for(let address in users){
        if(users[address].type === "Issuer"){
          issuersList.push({name:users[address].name, value:address});
        }
    }
  })
    setIssuer(issuersList);
  }

  const getRequest = async()=>{

  }

  const columns = [
    { title: "Institution", dataIndex: "name", key: "key" },
    {
      title: "Status",
      dataIndex: "status",
      key: "key",
      render: (status) => {
        let color = status === "Accepted" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Email", dataIndex: "email", key: "key" },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const getRequestList = async() => {
    let allRequest = [];
    let rejectRequest = [];

    const approveIssuers = await certStoreContract.methods.getApprovedReqList().call({ from: accounts[0] });
        for(let i = 0; i < approveIssuers.length; i++) {
            await getUserByAddress(approveIssuers[i]).then((user) => {
              allRequest.push(user);
        })
    }
    allRequest = allRequest.map((v) => ({...v, status: 'Issued'}));


    const deniedIssuers = await certStoreContract.methods.getRejectedReqList().call({ from: accounts[0] });
    for(let j = 0; j < deniedIssuers.length; j++) {
        await getUserByAddress(deniedIssuers[j]).then((user) => {
          rejectRequest.push(user);
        });
    }
    rejectRequest = rejectRequest.map((dv) => ({...dv, status: 'Rejected'}));

    allRequest.push(...rejectRequest);
    allRequest = allRequest.map((v, index) => ({...v, key: index+1}));

    setCertificateReq(allRequest);
};

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title
            level={2}
            style={{ paddingLeft: 20, paddingTop: 20 }}
          >
            Certificate Request
          </Typography.Title>
        </Col>
        <Col style={{ paddingRight: 20 }}>
          <Button type="primary" onClick={showModal}>
            + New Request
          </Button>{" "}
        </Col>
        <Modal
          title="New Request"
          visible={isModalVisible}
       onCancel={handleCancel}
          footer={null}
        >
          <Form form={form} onFinish={onFinish}>
            <Form.Item
              name="institution"
              label="Institution"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select a institution" allowClear>
                {issuer.map((institution) => (
                  <Select.Option  
                  value={institution.value}
                  >
                    
                     {institution.name} 
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
      
            </Form.Item>
          </Form>
        </Modal>
      </Row>

      <Table columns={columns} dataSource={certificateReq}></Table>
    </>
  );
};

export default CertificateRequest;
