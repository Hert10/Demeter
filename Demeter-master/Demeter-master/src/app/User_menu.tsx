import { useState, useRef, useEffect } from "react";

export default function UserMenu({username}){
    const [showMenu, setshowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function clickoutside(event) {
                if(menuRef.current && !menuRef.current.contains(event.target)){
                    setshowMenu(false);
                }
        }
        document.addEventListener('mousedown', clickoutside);
        return () => {
            document.removeEventListener('mousedown', clickoutside);
        };
    },[]);
    const togglemenu = () => setshowMenu(!showMenu);
    return(
        <div className="dropdown" ref={menuRef}>
            <span className="text success fw-bold dropdown-toggle" 
            style={{cursor:'pointer'}}
            onClick={togglemenu}
            >
                <i className="bi bi-person-circle me-2"></i>

                    Hello,  {username}
            </span>
            {showMenu && (

<div className="dropdown-menu show" style={{ display: 'block' }}>
<button 
  className="dropdown-item d-flex align-items-center text-decoration-none" 
  onClick={() => {
    setshowMenu(false);
    window.location.href = './account';
  }}
>
  <i className="bi bi-person-circle me-2"></i>
  <span>Profile</span>
</button>

<form action="/auth/signout" method="post">
  <button 
    type="submit" 
    className="dropdown-item d-flex align-items-center text-decoration-none w-100 bg-transparent border-0"
  >
    <i className="bi bi-box-arrow-right me-2"></i>
    <span>Sign Out</span>
  </button>
</form>
</div>
            )}

        </div>
    )
}