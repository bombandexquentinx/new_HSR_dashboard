import React from "react";
import {
  faAngleDown,
  faAngleUp,
  faArrowDown,
  faArrowUp,
  faEdit,
  faEllipsisH,
  faExternalLinkAlt,
  faEye,
  faTrashAlt,
  faDoorClosed,
} from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Nav,
  Card,
  Image,
  Button,
  Table,
  ProgressBar,
  Pagination,
  Dropdown,
  ButtonGroup
} from "@themesberg/react-bootstrap";

import listingService from "../../services/ListingService";

const ListingTable = ({
  data,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}) => {
  const totalTransactions = data.length;

  const TableRow = (props) => {
    const {
      id,
      type,
      subcategory,
      title,
      subtitle,
      display_image,
      short_description,
      status,
      service_name,
      service_location,
      created_at,
    } = props;
    // const { invoiceNumber, subscription, price, issueDate, dueDate, status } = props;
    const statusVariant =
      status === "published"
        ? "success"
        : status === "unpublished"
        ? "warning"
        : status === "close"
        ? "danger"
        : "primary";

    const handleStatusChange = async (newStatus) => {
      try {
        const body = {
          id: id,
          status: newStatus,
        };
        const response = await listingService.updateStatus(body);
        console.log("Status updated:", response.data);
        // Optionally, you can update the UI or refresh the data
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };

    const date = new Date(created_at);

    return (
      <tr>
        {/* <td>
            <Card.Link as={Link} to={Routes.Invoice.path} className="fw-normal">
              {invoiceNumber}
            </Card.Link>
          </td> */}
        <td style={{ textAlign: "left" }}>
          <span className="fw-normal">{title}</span>
          <p>{subtitle}</p>
        </td>
        <td style={{ textAlign: "left" }}>
          <span className="fw-normal">{type}</span>
        </td>
        <td style={{ textAlign: "left" }}>
          <span className="fw-normal">{date.toLocaleString()}</span>
        </td>
        {/* <td>
            <span className="fw-normal">
              ${parseFloat(price).toFixed(2)}
            </span>
          </td> */}
        <td style={{ textAlign: "left" }}>
          <span className={`fw-normal text-${statusVariant}`}>{status}</span>
        </td>
        <td>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              as={Button}
              split
              variant="link"
              className="text-dark m-0 p-0"
            >
              <span className="icon icon-sm">
                {/* <FontAwesomeIcon icon={faEllipsisH} className="icon-dark" /> */}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleStatusChange("published")}>
                Publish
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleStatusChange("unpublished")}>
                UnPublish
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleStatusChange("achieve")}>
                Achieve
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleStatusChange("close")}
                className="text-danger"
              >
                Close
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    );
  };

  return (
    <Card border="light" className="table-wrapper table-responsive shadow-sm">
      <Card.Body className="pt-0">
        <Table hover className="user-table align-items-center">
          <thead>
            <tr>
              {/* <th className="border-bottom">#</th> */}
              <th className="border-bottom" style={{ textAlign: "left" }}>
                Service Name
              </th>
              <th className="border-bottom" style={{ textAlign: "left" }}>
                Type
              </th>
              <th className="border-bottom" style={{ textAlign: "left" }}>
                Created At
              </th>
              {/* <th className="border-bottom">Price</th> */}
              <th className="border-bottom" style={{ textAlign: "left" }}>
                Status
              </th>
              <th className="border-bottom" style={{ textAlign: "left" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <TableRow key={`transaction-${t.invoiceNumber}`} {...t} />
            ))}
          </tbody>
        </Table>
        <Card.Footer className="px-3 border-0 d-lg-flex align-items-center justify-content-between">
          <Nav>
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              >
                Previous
              </Pagination.Prev>
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
              >
                Next
              </Pagination.Next>
            </Pagination>
          </Nav>
          <small className="fw-bold">
            Showing <b>{totalTransactions}</b> out of <b>{totalItems}</b>{" "}
            entries
          </small>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
};

export default ListingTable;
