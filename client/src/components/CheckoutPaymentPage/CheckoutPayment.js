import React, { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axios } from "../../config/constant";
import { Steps, Radio, message, Breadcrumb } from "antd";
import { Link, useHistory } from "react-router-dom";
import { Button, Navbar, Nav } from "react-bootstrap";
import ids from "short-id";
import { useCookies } from "react-cookie";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPayment() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [dataGioHangNew, setDataGioHangNew] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies();
  const { Step } = Steps;
  // const { Option } = Select;
  const [valueRadioGiaoHang, setValueRadioGiaoHang] = useState(0);
  const [valueRadioThanhToan, setValueRadioThanhToan] = useState(0);
  const thongTinDatHang = useSelector((state) => state.thongTinDatHang);
  const [total, setTotal] = useState(0);
  const [orderID, setOrderID] = useState(false);
  const [dataVoucher, setDataVoucher] = useState({
    idShow: "",
    loaiGiamGia: "",
    giaTriGiam: "",
  });

  const [idVoucher, setIdVoucher] = useState(localStorage.getItem("idVoucher"));
  const [dataGioHang, setDataGioHang] = useState(
    JSON.parse(localStorage.getItem("dataGioHang"))
  );
  const steps = [
    {
      title: "Đăng nhập",
    },
    {
      title: "Địa chỉ giao hàng",
    },
    {
      title: "Thanh toán & Đặt mua",
    },
  ];
  const [thongTinDonHang, setThongTinDonHang] = useState({
    idShow: "",
    thongTinNguoiMua: {
      hoTen: "",
      sdt: "",
      diaChi: "",
    },
    tongTien: "",
    soLuongSanPham: "",
    ngayTao: "",
    idVoucher: "",
  });

  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px",
  };

  const onSuccess = (payment) => {
    // Congratulation, it came here means everything's fine!
    console.log("The payment was succeeded!", payment);
    TaoDonHang_ThanhToan_PayPal(dataGioHangNew);
    // You can bind the "payment" object's value to your state or props or whatever here, please see below for sample returned data
  };

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            description: "",
            amount: {
              currency_code: "USD",
              value: total,
            },
          },
        ],
        // not needed if a shipping address is actually needed
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        setOrderID(orderID);
        return orderID;
      });
  };

  // check Approval
  const onApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      onSuccess();
    });
  };

  function format_curency(a) {
    a = a.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return a;
  }

  function tinhThanhTien(tienTamTinh, dataVoucher, tienShip) {
    var tienGiam = 0;
    if (dataVoucher === "") {
      return tienTamTinh;
    } else {
      if (dataVoucher.loaiGiamGia === 0) {
        tienGiam = parseInt(dataVoucher.giaTriGiam);
        return parseInt(tienTamTinh - tienGiam - tienShip);
      } else {
        tienGiam = parseInt((tienTamTinh * dataVoucher.giaTriGiam) / 100);
        return parseInt(tienTamTinh - tienGiam - tienShip);
      }
    }
  }

  function tinhTienMoiSanPham(giaCuoiCung, soLuong) {
    var tien = parseInt(giaCuoiCung * soLuong);
    return tien;
  }

  function getGioHangTheoIDUser() {
    var arrayGioHangNew = [];

    for (let index = 0; index < dataGioHang.length; index++) {
      if (dataGioHang[index].idUser === cookies.userID) {
        arrayGioHangNew.push({
          giaCuoiCung: dataGioHang[index].giaCuoiCung,
          giaGoc: dataGioHang[index].giaGoc,
          idShop: dataGioHang[index].idShop,
          idUser: dataGioHang[index].idUser,
          img: dataGioHang[index].img,
          khuyenMai: dataGioHang[index].khuyenMai,
          mauSac: dataGioHang[index].mauSac,
          size: dataGioHang[index].size,
          soLuong: dataGioHang[index].soLuong,
          ten: dataGioHang[index].ten,
          tenShop: dataGioHang[index].tenShop,
          index: index,
        });
      }
    }

    setDataGioHangNew(arrayGioHangNew);
  }

  function tienTamTinh(data) {
    var tien = 0;
    for (let index = 0; index < data.length; index++) {
      tien += data[index].soLuong * data[index].giaCuoiCung;
    }
    return parseInt(tien);
  }

  function tinhTongSanPhamTrongGioHang(data) {
    var tong = 0;
    for (let index = 0; index < data.length; index++) {
      tong += data[index].soLuong;
    }
    return parseInt(tong);
  }

  async function KiemTraVoucher(voucherID) {
    if (idVoucher !== undefined) {
      let res = await axios.get(
        "hethong/vouchers-item-show?idShow=" + voucherID
      );

      if (res.data.status === "success") {
        setDataVoucher({
          idShow: res.data.data.idShow,
          loaiGiamGia: res.data.data.loaiGiamGia,
          giaTriGiam: res.data.data.giaTriGiam,
        });
      }
    }
  }

  async function TaoDonHang_ThanhToan_COD(dataGioHang) {
    let res = await axios.post("hethong/orders-them", {
      emailNhan: localStorage.getItem("email"),
      idShow: thongTinDonHang.idShow,
      thongTinNguoiMua: {
        hoTen: thongTinDonHang.thongTinNguoiMua.hoTen,
        sdt: thongTinDonHang.thongTinNguoiMua.sdt,
        diaChi: thongTinDonHang.thongTinNguoiMua.diaChi,
      },
      tongTien: thongTinDonHang.tongTien,
      soLuongSanPham: thongTinDonHang.soLuongSanPham,
      hinhThucThanhToan: valueRadioThanhToan,
      ngayTao: thongTinDonHang.ngayTao,
      idUser: cookies.userID,
      idVoucher: thongTinDonHang.idVoucher,
      dataGioHang: dataGioHangNew,
    });

    if (res.data.status === "fail") {
      console.log(res);
      message.error(res.data.message);
    } else {
      message.success("Đã tạo đơn hàng thành công");
      localStorage.setItem("dataGioHang", "[]");
      localStorage.setItem("idVoucher", undefined);
      history.push("/checkout/payment/success/" + thongTinDonHang.idShow);
    }
  }

  async function TaoDonHang_ThanhToan_PayPal(dataGioHang) {
    let res = await axios.post("hethong/orders-them", {
      emailNhan: localStorage.getItem("email"),
      idShow: thongTinDonHang.idShow,
      thongTinNguoiMua: {
        hoTen: thongTinDonHang.thongTinNguoiMua.hoTen,
        sdt: thongTinDonHang.thongTinNguoiMua.sdt,
        diaChi: thongTinDonHang.thongTinNguoiMua.diaChi,
      },
      tongTien: thongTinDonHang.tongTien,
      soLuongSanPham: thongTinDonHang.soLuongSanPham,
      hinhThucThanhToan: valueRadioThanhToan,
      ngayTao: thongTinDonHang.ngayTao,
      idUser: cookies.userID,
      idVoucher: thongTinDonHang.idVoucher,
      dataGioHang: dataGioHangNew,
    });

    if (res.data.status === "success") {
      message.success("Đã tạo đơn hàng thành công");
      history.push("/checkout/payment/success/" + thongTinDonHang.idShow);
      localStorage.setItem("dataGioHang", "[]");
      localStorage.setItem("idVoucher", undefined);
    } else {
      message.error("Đã tạo đơn hàng thất bại");
    }
  }

  useEffect(() => {
    KiemTraVoucher(idVoucher);
    dispatch({ type: "CLOSE_HEADER" });
    getGioHangTheoIDUser();
    if (thongTinDatHang.diaChi === "") {
      history.push("/checkout/shipping");
    }
  }, []);

  useEffect(() => {
    setThongTinDonHang({
      ...thongTinDonHang,
      idShow: "ORDER-" + ids.generate().toUpperCase(),
      thongTinNguoiMua: {
        hoTen: thongTinDatHang.hoTen,
        sdt: thongTinDatHang.sdt,
        diaChi:
          thongTinDatHang.diaChi +
          ", phường " +
          thongTinDatHang.phuong +
          ", " +
          thongTinDatHang.quan +
          ", " +
          thongTinDatHang.thanhPho,
      },
      tongTien: tinhThanhTien(tienTamTinh(dataGioHangNew), dataVoucher, 0),
      soLuongSanPham: tinhTongSanPhamTrongGioHang(dataGioHang),
      ngayTao: new Date(),
    });
    setTotal(
      parseInt(
        tinhThanhTien(tienTamTinh(dataGioHangNew), dataVoucher, 0) / 23300
      )
    );
  }, [dataGioHangNew]);

  return (
    <Fragment>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">
          <img
            alt=""
            src="/logo2.png"
            width="40"
            height="40"
            style={{ marginRight: 5 }}
            className="d-inline-block"
          />
          <span style={{ fontWeight: "bold", color: "blue" }}>WareHouse</span>
        </Navbar.Brand>
      </Navbar>
      <div className="container" style={{ height: "auto", padding: 20 }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href="/">Trang Chủ</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.pathname = "checkout/cart";
              }}
            >
              Giỏ hàng
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.pathname = "checkout/shipping";
              }}
            >
              Địa chỉ giao hàng
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.pathname = "checkout/payment";
              }}
            >
              Thanh toán & Đặt mua
            </a>
          </Breadcrumb.Item>
        </Breadcrumb>
        <br></br>
        <div className="col">
          <div>
            <Steps current={2}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
          </div>
          <br></br>
          <br></br>
          <div className="row">
            <div className="col-sm-9">
              <div>
                <h6>1. Chọn hình thức giao hàng</h6>
                <div style={{ height: "auto", paddingLeft: 20 }}>
                  <Radio.Group
                    onChange={(e) => {
                      setValueRadioGiaoHang(e.target.value);
                    }}
                    value={valueRadioGiaoHang}
                  >
                    <Radio style={radioStyle} value={0}>
                      Giao hàng tiêu chuẩn
                    </Radio>
                  </Radio.Group>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <h6>2. Chọn hình thức thanh toán</h6>
                <div style={{ height: "auto", paddingLeft: 20 }}>
                  <Radio.Group
                    onChange={(e) => {
                      setValueRadioThanhToan(e.target.value);
                    }}
                    value={valueRadioThanhToan}
                  >
                    <Radio style={radioStyle} value={0}>
                      Thanh toán tiền mặt khi nhận hàng
                    </Radio>
                    <Radio style={radioStyle} value={1}>
                      Thanh toán bằng Paypal
                    </Radio>
                  </Radio.Group>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <h6 style={{ color: "gray" }}>Thông tin người mua</h6>
                <div
                  className="col"
                  style={{ height: "auto", paddingLeft: 20 }}
                >
                  <div className="row">
                    <div className="col-sm-2">
                      <strong>Họ tên:</strong>
                    </div>
                    <div className="col-sm-6">{thongTinDatHang.hoTen}</div>
                  </div>

                  <div className="row">
                    <div className="col-sm-2">
                      <strong>Số điện thoại:</strong>
                    </div>
                    <div className="col-sm-6">{thongTinDatHang.sdt}</div>
                  </div>

                  <div className="row">
                    <div className="col-sm-2">
                      <strong>Địa chỉ:</strong>
                    </div>
                    <div className="col-sm-6">
                      {thongTinDatHang.diaChi +
                        ", phường " +
                        thongTinDatHang.phuong +
                        ", " +
                        thongTinDatHang.quan +
                        ", " +
                        thongTinDatHang.thanhPho}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col" style={{ marginTop: 20 }}>
                {valueRadioThanhToan === 0 && (
                  <Button
                    style={{ width: 300 }}
                    variant="primary"
                    size="lg"
                    onMouseOver={() => {
                      if (idVoucher.length > 0) {
                        setThongTinDonHang({
                          ...thongTinDonHang,
                          idVoucher: idVoucher,
                        });
                      }
                    }}
                    onClick={() => {
                      TaoDonHang_ThanhToan_COD(dataGioHangNew);
                    }}
                  >
                    ĐẶT MUA
                  </Button>
                )}
                {valueRadioThanhToan === 1 && (
                  <Link
                    to={"payment/success/" + thongTinDonHang.idShow}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    onMouseOver={() => {
                      if (idVoucher.length > 0) {
                        setThongTinDonHang({
                          ...thongTinDonHang,
                          idVoucher: idVoucher,
                        });
                      }
                    }}
                  >
                    <PayPalScriptProvider
                      options={{
                        "client-id":
                          "AQExI7j_6V9Qk0XDLdJEIfcmasm8YEiMdD7J_Eyb5LlCMwCXv2_ws11sazn7OPktpz7xh_XJDy3DQ43B",
                        currency: "USD",
                        "disable-funding": "credit,card",
                      }}
                    >
                      <PayPalButtons
                        style={{
                          size: "large",
                          color: "blue",
                          shape: "rect",
                          label: "checkout",
                        }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                      />
                    </PayPalScriptProvider>
                  </Link>
                )}
                <br></br>
                (Xin vui lòng kiểm tra lại đơn hàng trước khi Đặt mua)
              </div>
            </div>
            <div
              className="col-sm-3"
              style={{ height: "auto", backgroundColor: "#F8F9FA" }}
            >
              <div className="row" style={{ padding: 10 }}>
                <span>
                  <strong>
                    Đơn hàng ({tinhTongSanPhamTrongGioHang(dataGioHangNew)} sản
                    phẩm)
                  </strong>{" "}
                  &nbsp;
                  <Link to="/checkout/cart">Sửa</Link>
                </span>
              </div>
              <hr style={{ marginTop: 5 }}></hr>
              <div className="col">
                {dataGioHangNew.map((item, i) => {
                  return (
                    <div className="row" key={i}>
                      <div
                        className="col-sm-8"
                        style={{ height: "auto", marginLeft: 0 }}
                      >
                        <strong>x{item.soLuong}</strong> {item.ten}{" "}
                        {item.mauSac !== "" ? " - " + item.mauSac : ""}{" "}
                        {item.size !== "" ? " - " + item.size : ""}
                      </div>
                      <div className="col-sm-4" style={{ paddingRight: 10 }}>
                        <span style={{ float: "right", fontWeight: "bold" }}>
                          {format_curency(
                            tinhTienMoiSanPham(
                              item.giaCuoiCung,
                              item.soLuong
                            ).toString()
                          )}
                          đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr></hr>
              <div className="col">
                <div className="row">
                  <div
                    className="col-sm-8"
                    style={{ height: "auto", marginLeft: 0 }}
                  >
                    Tạm tính
                  </div>
                  <div className="col-sm-4" style={{ paddingRight: 10 }}>
                    <span style={{ float: "right", fontWeight: "bold" }}>
                      {format_curency(tienTamTinh(dataGioHangNew).toString())}đ
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div
                    className="col-sm-8"
                    style={{ height: "auto", marginLeft: 0 }}
                  >
                    Voucher
                  </div>
                  <div className="col-sm-4" style={{ paddingRight: 10 }}>
                    <span style={{ float: "right", fontWeight: "bold" }}>
                      {dataVoucher.idShow !== "" &&
                        (dataVoucher.loaiGiamGia === 0
                          ? "-" +
                            format_curency(dataVoucher.giaTriGiam.toString()) +
                            "đ"
                          : "-" + dataVoucher.giaTriGiam + "%")}
                      {dataVoucher.idShow === "" && "-0đ"}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div
                    className="col-sm-8"
                    style={{ height: "auto", marginLeft: 0 }}
                  >
                    Phí vận chuyển
                  </div>
                  <div className="col-sm-4" style={{ paddingRight: 10 }}>
                    <span style={{ float: "right", fontWeight: "bold" }}>
                      0đ
                    </span>
                  </div>
                </div>
              </div>
              <hr></hr>
              <div className="col">
                <div className="row">
                  <div
                    className="col-sm-8"
                    style={{ height: "auto", marginLeft: 0 }}
                  >
                    Thành tiền
                  </div>
                  <div className="col-sm-4" style={{ paddingRight: 10 }}>
                    <span
                      style={{
                        float: "right",
                        color: "red",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      {format_curency(
                        tinhThanhTien(
                          tienTamTinh(dataGioHangNew),
                          dataVoucher,
                          0
                        ).toString()
                      )}
                      đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
