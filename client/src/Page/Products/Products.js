const Products = () => {
  return (
    <div className="container d-flex">
      <div style={{ flex: 1, padding: "16px" }}>
        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "24px",
          }}
        >


        </div>

      </div>
      
    </div>
  );
};

export default Products;
