import React from "react";

export function Input(props) {
  return (
    <input {...props} className="px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300" />
  );
}
