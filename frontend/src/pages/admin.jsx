import {A, Outlet, useLocation, useSearchParams} from "@solidjs/router";
import {useUser} from "../contexts/usercontextprovider";
import "./adminNav.css";

const URL_TO_PAGE = {
    '/admin': 'DASHBOARD',
    '/admin/users': 'USERS',
    '/admin/user': 'USERS',
    '/admin/statistics': 'STATISTICS',
    '/admin/filter': 'FILTER',
    '/admin/cashier': 'CASHIER',
    '/admin/rain': 'RAIN',
    '/admin/statsbook': 'STATSBOOK',
    '/admin/cases': 'CASES',
    '/admin/settings': 'SETTINGS',
    '/admin/spinshield': 'SLOTS'
}

function Admin(props) {

    const location = useLocation()
    const [user] = useUser()
    const [params, setParams] = useSearchParams()

    return (
        <>
            <div class='admin-container fadein'>

                <div class='banner'>
                    <img src='/assets/icons/logoswords.png' width='25' height='19' alt=''/>
                    <p>ADMIN PANEL</p>
                    <div className='line'/>
                </div>

                <div class='user-info'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
                        <path d="M7.99971 0.104492C5.35299 0.104492 3.19971 2.25777 3.19971 4.90449C3.19971 7.55121 5.35299 9.70449 7.99971 9.70449C10.6464 9.70449 12.7997 7.55121 12.7997 4.90449C12.7997 2.25777 10.6464 0.104492 7.99971 0.104492Z" fill="#ADA3EF"/>
                        <path d="M13.9721 12.8403C12.658 11.506 10.9159 10.7712 9.06667 10.7712H6.93333C5.08416 10.7712 3.34201 11.506 2.02788 12.8403C0.720178 14.1681 0 15.9208 0 17.7756C0 18.0702 0.238791 18.309 0.533333 18.309H15.4667C15.7612 18.309 16 18.0702 16 17.7756C16 15.9208 15.2798 14.1681 13.9721 12.8403Z" fill="#ADA3EF"/>
                    </svg>

                    <p>
                        ADMIN USER -
                        &nbsp;<span class='gold id'>ACCOUNT ID</span>
                        &nbsp;<span class='id gray'>{user()?.id}</span>
                    </p>
              
                </div>

                <div class="admin-nav-wrapper">
                    <nav class='admin-nav-container'>
                        <A href='/admin' class={`nav-link ${location?.pathname === '/admin' ? 'active' : ''}`}>DASHBOARD</A>
                        <A href='/admin/users' class={`nav-link ${location?.pathname === '/admin/users' || location?.pathname === '/admin/user' ? 'active' : ''}`}>USERS</A>
                        <A href='/admin/statistics' class={`nav-link ${location?.pathname === '/admin/statistics' ? 'active' : ''}`}>STATISTICS</A>
                        <A href='/admin/filter' class={`nav-link ${location?.pathname === '/admin/filter' ? 'active' : ''}`}>FILTER</A>
                        <A href='/admin/cashier' class={`nav-link ${location?.pathname === '/admin/cashier' ? 'active' : ''}`}>CASHIER</A>
                        <A href='/admin/rain' class={`nav-link ${location?.pathname === '/admin/rain' ? 'active' : ''}`}>RAIN</A>
                        <A href='/admin/statsbook' class={`nav-link ${location?.pathname === '/admin/statsbook' ? 'active' : ''}`}>STATSBOOK</A>
                        <A href='/admin/cases' class={`nav-link ${location?.pathname === '/admin/cases' ? 'active' : ''}`}>CASES</A>
                        <A href='/admin/spinshield' class={`nav-link ${location?.pathname === '/admin/spinshield' ? 'active' : ''}`}>SLOTS</A>
                        <A href='/admin/settings' class={`nav-link ${location?.pathname === '/admin/settings' ? 'active' : ''}`}>SETTINGS</A>
                    </nav>
                </div>
                
                <div className='bar' style={{margin: '25px 0 30px 0'}}/>

                <Outlet/>
            </div>

            <style jsx>{`
              .admin-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0;
                margin: 0 auto;
              }

              .bar {
                width: 100%;
                height: 1px;
                min-height: 1px;
                background: #5A5499;
              }
              
              .user-info {
                display: flex;
                gap: 10px;
                align-items: center;

                color: #FFF;
                font-size: 18px;
                font-weight: 700;
              }
              
              .admin-nav-wrapper {
                margin: 25px 0;
                background: rgba(74, 69, 129, 0.15);
                border-radius: 10px;
                padding: 10px 20px;
                position: relative;
                border: 1px solid rgba(74, 69, 129, 0.5);
              }
              
              .admin-nav-wrapper::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #ff9903, transparent);
                border-radius: 2px;
              }
              
              /* The rest of the navigation styles are now in adminNav.css */
              
              .cashier-type-selector {
                display: flex;
                margin-left: auto;
                gap: 5px;
                background: #312a5e;
                padding: 5px;
                border-radius: 8px;
                border: 1px solid #4A4581;
              }
              
              .id {
                font-size: 14px;
              }
              
              .id.gray {
                color: #9F9AC8;
                font-weight: 500;
              }
              
              .banner {
                outline: unset;
                border: unset;

                width: 100%;
                height: 45px;

                border-radius: 5px;
                background: linear-gradient(90deg, rgb(104, 100, 164) -49.01%, rgba(90, 84, 149, 0.655) -5.08%, rgba(66, 53, 121, 0) 98.28%);

                padding: 0 15px;
                display: flex;
                align-items: center;
                gap: 12px;

                color: white;
                font-size: 22px;
                font-weight: 600;
                
                margin-bottom: 30px;
              }

              .line {
                flex: 1;
                height: 1px;

                border-radius: 2525px;
                background: linear-gradient(90deg, #5A5499 0%, rgba(90, 84, 153, 0.00) 100%);
              }

              @media only screen and (max-width: 1000px) {
                .admin-container {
                  padding-bottom: 90px;
                }
              }
            `}</style>
        </>
    );
}

export default Admin
