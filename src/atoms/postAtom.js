import { atom } from "recoil";

const postsAtom = atom({
    key: "postAStom",
    default: [],
});

export default postsAtom;
