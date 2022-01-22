import styled from "styled-components";
import Copyright from "./Copyright";
import Navigation from "./Navigation";
import SocialLinks from "./SocialLinks";

const _Footer = styled.footer`
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 2rem;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.8);

    > * + * {
        margin-top: 1rem;
    }
`;

export default function Footer() {
    return (
        <_Footer>
            <Copyright />
            <Navigation />
            <SocialLinks />
        </_Footer>
    );
}