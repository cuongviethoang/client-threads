import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
const UserPage = () => {
    return (
        <>
            <UserHeader />
            <UserPost
                likes={1200}
                replies={481}
                postImg="/post1.png"
                postTitle="Let's talk about threads"
            />
            <UserPost
                likes={1000}
                replies={500}
                postImg="/post2.png"
                postTitle="Nice tutorial"
            />
            <UserPost
                likes={900}
                replies={200}
                postImg="/post3.png"
                postTitle="I love this guy."
            />
            <UserPost
                likes={400}
                replies={200}
                postTitle="This is my first threads"
            />
        </>
    );
};

export default UserPage;
