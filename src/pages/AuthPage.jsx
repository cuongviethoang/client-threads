import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";
import authScreenAtom from "../atoms/authAtom";

const AuthPage = () => {
    // useSetRecoilState dùng để set lại giá trị default
    // useRecoilValue dùng để lấy giá trị default ra sử dụng
    const authScreenState = useRecoilValue(authScreenAtom);

    return <>{authScreenState === "login" ? <LoginCard /> : <SignupCard />}</>;
};

export default AuthPage;
