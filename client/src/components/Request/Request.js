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
} from "antd";
import PageHeader from "../PageHeader";
import PageFooter from "../PageFooter";
import PageSider from "../PageSider";

const CertificateRequest = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [issuer, setIssuer] = useState();
  const { Header, Footer, Sider, Content } = Layout;

  const [form] = Form.useForm();

  const certificateRequest = [
    {
      key: 1,
      institution: "NUS",
      date: "21/7/2022",
      status: "Accepted",
    },
    {
      key: 2,
      institution: "NUS",
      date: "21/7/2022",
      status: "Accepted",
    },
    {
      key: 3,
      institution: "SP",
      date: "11/3/2018",
      status: "Accepted",
    },
    {
      key: 4,
      institution: "NTU",
      date: "11/7/2026",
      status: "Accepted",
    },
    { key: 5, institution: "NTU", date: "11/7/2020", status: "Rejected" },
    {
      key: 6,
      institution: "SP",
      date: "11/1/2018",
      status: "Rejected",
    },
  ];

  const institutionList = [
    { name: "National University of Singapore", value: "NUS" },
    { name: "Nanyang Technological University", value: "NTU" },
    { name: "Singapore Institute of Management", value: "SIM" },
    { name: "Singapore Institute of Technology", value: "SIT" },
    { name: "Singapore Management University", value: "SMU" },
    { name: "Singapore University of Technology and Design", value: "SUTD" },
    { name: "Singapore  Polytechnic", value: "SP" },
    { name: "Nanyang Polytechnic", value: "NYP" },
    { name: "Ngee Ann Polytechnic", value: "NP" },
    { name: "Republic Polytechnic", value: "RP" },
    { name: "Temasik Polytechnic", value: "TP" },
  ];

  const columns = [
    { title: "Institution", dataIndex: "institution", key: "key" },
    {
      title: "Status",
      dataIndex: "status",
      key: "key",
      render: (status) => {
        let color = status === "Accepted" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Date", dataIndex: "date", key: "key" },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = (values) => {
    console.log("onFinish", values);
    setIssuer(values);
    setIsModalVisible(false);
  };

  const onReset = () => {
    form.resetFields();
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
          onOk={handleOk}
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
                {institutionList.map((institution) => (
                  <Select.Option value={institution.value}>
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
              {/* <Button type='link' htmlType='button' onClick={onFill}>
                                Fill form
                            </Button> */}
            </Form.Item>
          </Form>
        </Modal>
      </Row>

      <Table columns={columns} dataSource={certificateRequest}></Table>

      {/* <h1>Requests for Certificates</h1> */}
      {/* <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Institution</th>
            <th>Status</th>
          </tr>
        </thead>
        {requests.map((req, i) => (
          <tr key={req.id}>
            <td>{req.id}</td>
            <td>{req.institution}</td>
            <td>{req.status}</td>
          </tr>
        ))}
        <tbody></tbody>
      </table> */}

      {/* <Table columns={columns} dataSource={requests} /> */}
    </>
  );
};

export default CertificateRequest;
