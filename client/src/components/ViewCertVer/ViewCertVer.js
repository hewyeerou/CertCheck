import React, { useState } from "react";
import { Table, Button, Modal } from "antd";
import ViewAllCertificates from "../ViewAllCertificates";

function ViewCertVer() {
  const [isViewCertModalVisible, setIsViewCertModalVisible] = useState(false);
  let user = JSON.parse(localStorage.getItem("user"));

  const studentList = [
    {
      name: "Puah Jia Qi",
      invitedDate: new Date().toLocaleString() + "",
    },
    {
      name: "Hew Yee Rou",
      invitedDate: new Date().toLocaleString() + "",
    },
    {
      name: "Ang Yi Qi",
      invitedDate: new Date().toLocaleString() + "",
    },
    {
      name: "Xie Ran",
      invitedDate: new Date().toLocaleString() + "",
    },
  ];

  const columns = [
    { title: "Student Name", dataIndex: "name", key: "name" },
    { title: "Invited Date", dataIndex: "invitedDate", key: "invitedDate" },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          onClick={() => {
            showViewCertModal();
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const showViewCertModal = () => {
    setIsViewCertModalVisible(true);
  };

  const handleOk = () => {
    setIsViewCertModalVisible(false);
  };

  const handleCancel = () => {
    setIsViewCertModalVisible(false);
  };

  return (
    <>
      <Modal
        title="Digital Certificate"
        visible={isViewCertModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <ViewAllCertificates user={user}/>
      </Modal>
      <Table columns={columns} dataSource={studentList}></Table>
    </>
  );
}

export default ViewCertVer;
