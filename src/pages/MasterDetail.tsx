import { useParams, Navigate } from "react-router-dom";
import MasterProfile from "./MasterProfile";

// Redirect /masters/:id to use the same rich profile component
export default function MasterDetail() {
  return <MasterProfile />;
}
