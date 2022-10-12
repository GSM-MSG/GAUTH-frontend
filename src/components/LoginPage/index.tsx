import Link from "next/link"
import { useEffect, useRef, useState } from "react";
import * as S from "./style"
import { API } from "../../lib/API";

export default function LoginPage() {
    const waveRef = useRef<any>();
    const [email, setEmail] = useState<string>("");
    const [pw, setPw] = useState<string>("");
    const [emailCheck, setEmailCheck] = useState<boolean>(false);
    const [pwCheck, setPwCheck] = useState<boolean>(false);
    const [error, setError] = useState<number>(200);


    useEffect(() => {
        waveRef.current.children[0].style.width = "100vh";
        waveRef.current.children[1].style.width = "100vh";
        waveRef.current.children[2].style.width = "100vh";
    }, [email])



    const SignUp = async () => {

        try {
            const { data } = await API.post('/auth', {
                email: email + "@gsm.hs.kr",
                password: pw
            })
            localStorage.setItem('Gauth-accessToken', data.accessToken);
            localStorage.setItem('Gauth-refreshToken', data.refreshToken);
            alert("성공");
        } catch (e: any) {
            if (e.response.status === 400) {
                alert("비밀번호가 일치하지 않습니다.");
            } else if (e.response.status === 404) {
                alert("이메일이 일치하지 않습니다.");
            };
            setError(e.response.status);
        }
    }


    return (
        <S.Layer>
            <div ref={waveRef}>
                <S.SideWave fill="url(#gradient1)" options={{
                    height: 0,
                    amplitude: 150,
                    speed: 0.185,
                    points: 1
                }}>
                    <defs>
                        <linearGradient id="gradient1" gradientTransform="rotate(180)">
                            <stop offset="0%" stopColor="#7EB2E2" />
                            <stop offset="100%" stopColor="#5499D9" />
                        </linearGradient>
                    </defs>
                </S.SideWave>
                <S.SideWave fill="url(#gradient2)" options={{
                    height: 100,
                    amplitude: 200,
                    speed: 0.17,
                    points: 1
                }}>
                    <defs>
                        <linearGradient id="gradient2" gradientTransform="rotate(180)">
                            <stop offset="0%" stopColor="#5499D9" />
                            <stop offset="100%" stopColor="#2E80CC" />
                        </linearGradient>
                    </defs>
                </S.SideWave>
                <S.SideWave fill="url(#gradient3)" options={{
                    height: 200,
                    amplitude: 250,
                    speed: 0.17,
                    points: 1
                }}>
                    <defs>
                        <linearGradient id="gradient3" gradientTransform="rotate(208.17)">
                            <stop offset="11.3%" stopColor="#2E80CC" />
                            <stop offset="100%" stopColor="#2566A2" />
                        </linearGradient>
                    </defs>
                </S.SideWave>
                <S.Title>
                    <S.Img src="/svg/LoginLogo.svg" />
                    <div>
                        <h1>GAUTH</h1>
                        <h2>GSM 통합 계정관리 시스템</h2>
                    </div>
                </S.Title>
            </div>
            <S.LoginWrapper>
                <S.LoginContainer>
                    <h1>LOGIN</h1>
                    <S.InputContainer>
                        <S.InputWrapper>
                            <S.InputName being={emailCheck}>{error === 400 ? "이메일이 일치하지 않습니다" : "이메일을 입력하세요"}</S.InputName>
                            <input name="email" type="text" maxLength={6} value={email}
                                onChange={(e: any) => { if (!(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(e.target.value))) setEmail(e.target.value) }}
                                onFocus={() => { setEmailCheck(true) }}
                                onBlur={() => { !email && setEmailCheck(false) }}
                            />
                            {email && <S.Email left={email.length * 13.5}>@gsm.hs.kr</S.Email>}
                        </S.InputWrapper>
                        <S.InputWrapper>
                            <S.InputName being={pwCheck}>{error === 400 ? "비밀번호가 일치하지 않습니다" : "비밀번호를 입력하세요"}</S.InputName>
                            <input name="pw" type="password" maxLength={72} value={pw}
                                onChange={(e: any) => { setPw(e.target.value) }}
                                onFocus={() => { setPwCheck(true) }}
                                onBlur={() => { !pw && setPwCheck(false) }} />
                        </S.InputWrapper>
                    </S.InputContainer>
                    <S.ButtonContainer>
                        <S.Submit onClick={SignUp}>로그인</S.Submit>
                        <div>
                            <Link href="/register">회원가입</Link> | <Link href="/find">비밀번호 찾기</Link>
                        </div>
                    </S.ButtonContainer>
                </S.LoginContainer >
            </S.LoginWrapper >
        </S.Layer >
    )
}