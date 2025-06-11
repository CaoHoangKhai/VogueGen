const OrderList = () => {
    return (
        <>
            <div>
                <div className="container">
                    <div className="card p-4 shadow-sm">

                        <h4 className="text-center mb-3">Danh Sách Đơn Hàng</h4>

                        <table className="table table-bordered table-hover text-center">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã Đơn Hàng</th>
                                    <th>Họ Tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </>

    )
}

export default OrderList;