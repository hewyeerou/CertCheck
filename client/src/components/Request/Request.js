import React from "react";
import { Table, Tag, Space } from "antd";

function Request() {
  let requests = [
    { id: 1, institution: "NUS", status: "pending" },
    { id: 2, institution: "NYP", status: "approved" },
    { id: 3, institution: "SP", status: "approved" },
  ];

  const columns = [
    {
      title: "No",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Institution",
      dataIndex: "institution",
      key: "institution",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <>
      <h1>Requests for Certificates</h1>
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

      <Table columns={columns} dataSource={requests} />
    </>
  );
}

export default Request;
