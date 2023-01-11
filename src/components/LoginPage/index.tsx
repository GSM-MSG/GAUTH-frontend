import Link from 'next/link';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as S from './style';
import { API } from '../../lib/API';
import SideWave from './SideWave';
import { accessToken, expiredAt, refreshToken } from '../../lib/Token';
import { useRecoilValue } from 'recoil';
import { ViewWidth } from '../../Atom/Atoms';
import { LoginLogo } from '../../../public/svg';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [serviceName, setServiceName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [emailCheck, setEmailCheck] = useState<boolean>(false);
  const [pwCheck, setPwCheck] = useState<boolean>(false);
  const [error, setError] = useState<number>(200);
  const [loginTitleWidth, setLoginTitleWidth] = useState<number>(50);
  const viewWidth = useRecoilValue(ViewWidth);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement[]>([]);
  const serviceNameRef = useRef<HTMLSpanElement>(null);
  const isQuery =
    router.query.client_id !== undefined &&
    router.query.redirect_uri !== undefined;

  const makeTitleSize = () => {
    setLoginTitleWidth(() => {
      if (window.innerWidth > 550) return 45;
      return (
        (window.innerWidth * 4) /
        5 /
        ((serviceNameRef.current?.innerText.length ?? 16) - 1)
      );
    });
  };

  useEffect(() => {
    makeTitleSize();
    addEventListener('resize', () => makeTitleSize());
  }, [serviceName, setServiceName]);

  useEffect(() => {
    if (!router.isReady) return;
    isQuery && titleNaming();
  }, [router.isReady]);

  const titleNaming = async () => {
    try {
      const { data } = await API.get(`/oauth/${router.query.client_id}`);
      setServiceName(data.serviceName);
    } catch (e) {
      if (e instanceof AxiosError && e.response!.status === 404) {
        toast.error('해당하는 서비스가 없습니다.');
        router.back();
      } else {
        toast.error('예기치 못한 오류가 발생하였습니다.');
      }
    }
  };

  const onLogin = async () => {
    for (let i = 0; i < inputRef.current.length; i++) {
      if (inputRef.current[i].value === '') {
        toast.warn(inputRef.current[i].name + '을(를) 입력하지 않았습니다.');
        return inputRef.current[i].focus();
      }
    }

    try {
      const { data } = await API.post(isQuery ? '/oauth/code' : '/auth', {
        email: email + '@gsm.hs.kr',
        password: pw,
      });

      if (isQuery)
        return router.replace(`${router.query.redirect_uri}?code=${data.code}`);

      localStorage.setItem(accessToken, data.accessToken);
      localStorage.setItem(refreshToken, data.refreshToken);
      localStorage.setItem(expiredAt, data.expiresAt);
      API.defaults.headers.common['Authorization'] =
        'Bearer ' + data.accessToken;
      router.replace('/');
    } catch (e) {
      if (!(e instanceof AxiosError))
        return toast.error('예기치 못한 오류가 발생하였습니다.');
      if (e.response?.status === 400 || e.response?.status === 404)
        toast.warn('이메일 또는 비밀번호가 틀렸습니다.');
      if (e.response!.status === 403) toast.info('관리자의 승인이 필요합니다');
      setError(e.response!.status);
    }
  };

  return (
    <S.Layer>
      <SideWave />
      {viewWidth >= 900 && (
        <S.TitleWrapper>
          <S.TitleBox>
            <LoginLogo />
            <div>
              <h1>GAUTH</h1>
              <h2>GSM 통합 계정관리 시스템</h2>
            </div>
          </S.TitleBox>
        </S.TitleWrapper>
      )}
      <S.LoginWrapper>
        <S.LoginContainer>
          {serviceName === '' ? (
            <h1>Login</h1>
          ) : (
            <S.LoginName width={loginTitleWidth}>
              <span>GAuth</span> 계정으로
              <br />
              <span ref={serviceNameRef}>{serviceName}에 로그인</span>
            </S.LoginName>
          )}
          <S.InputContainer>
            <S.InputWrapper>
              <S.InputName being={emailCheck} error={error}>
                이메일
              </S.InputName>
              <div>
                <input
                  name="이메일"
                  type="email"
                  maxLength={6}
                  value={email}
                  ref={(e: HTMLInputElement) => (inputRef.current[0] = e)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value.replace(/[^a-zA-Z\d]/gi, ''));
                  }}
                  onFocus={() => {
                    setEmailCheck(true);
                  }}
                  onBlur={() => {
                    !email && setEmailCheck(false);
                  }}
                />
                <S.Email>@gsm.hs.kr</S.Email>
              </div>
            </S.InputWrapper>
            <S.InputWrapper>
              <S.InputName being={pwCheck} error={error}>
                비밀번호
              </S.InputName>
              <input
                name="비밀번호"
                type="password"
                maxLength={72}
                value={pw}
                ref={(e: HTMLInputElement) => (inputRef.current[1] = e)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPw(e.target.value);
                }}
                onFocus={() => {
                  setPwCheck(true);
                }}
                onBlur={() => {
                  !pw && setPwCheck(false);
                }}
                onKeyUp={(e) => {
                  e.code === 'Enter' && onLogin();
                }}
              />
            </S.InputWrapper>
          </S.InputContainer>
          <S.ButtonContainer>
            <S.Submit onClick={onLogin}>로그인</S.Submit>
            <div>
              <Link href="/signUp">회원가입</Link> <span>l</span>{' '}
              <Link href="/initPassword">비밀번호 찾기</Link>
            </div>
          </S.ButtonContainer>
        </S.LoginContainer>
      </S.LoginWrapper>
    </S.Layer>
  );
}
