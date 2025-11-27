import React from "react";

export default function FileUploader({ onUpload }) {
  return (
    <div className="my-2">
      <input
        type="file"
        onChange={(e) => {
          if (onUpload) onUpload(e.target.files[0]);
        }}
        className="border p-2 rounded"
      />
    </div>
  );
}

