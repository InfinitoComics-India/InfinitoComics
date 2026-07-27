import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
export const showAlert = (type, onConfirm) => {
  const config = {
    icon: "success",
    title: "",
    html: "",
    showConfirmButton: true,
    confirmButtonText: "Awesome!",
    confirmButtonColor: "#4CAF50",
    backdrop: `
      rgba(0,0,123,0.4)
      left top
      no-repeat
    `,
  };
  switch (type) {
    case "published":
      config.title = "🎉 Chapter Published!";
      config.html = `<strong>Your chapter has been <span style="color:#4CAF50;">successfully published</span>!</strong>`;
      config.icon = "success";
      break;
    case "updated":
      config.title = "✏️ Chapter Updated!";
      config.html = `<strong>Your chapter changes have been <span style="color:#2196F3;">saved</span>!</strong>`;
      config.icon = "info";
      config.confirmButtonColor = "#2196F3";
      break;
    case "deleted":
      config.title = "🗑️ Chapter Deleted!";
      config.html = `<strong>The chapter has been <span style="color:#f44336;">permanently removed</span>.</strong>`;
      config.icon = "warning";
      config.confirmButtonColor = "#f44336";
      break;
    default:
      config.title = "✅ Success";
      config.html = "Operation completed successfully!";
  }
  MySwal.fire(config).then(() => {
    if (onConfirm) {
      onConfirm(); 
    } else {
      window.location.reload(); 
    }
  });
};
