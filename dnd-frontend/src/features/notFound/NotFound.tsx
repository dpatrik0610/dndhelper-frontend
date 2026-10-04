import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconHome } from "@tabler/icons-react";
import { Die } from "@components/roll/Dice";
import classes from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // React Router's history index: 0 means this is the first page of the visit, so "back" would leave the app.
  const canGoBack = (window.history.state?.idx ?? 0) > 0;

  return (
    <main className={classes.page}>
      <div className={classes.die} aria-hidden>
        <Die sides={20} value={1} size={128} active />
      </div>

      <p className={classes.eyebrow}>404 · Natural 1</p>
      <h1 className={`narrative-title ${classes.title}`}>Lost beyond the map</h1>
      <p className={classes.text}>
        No road leads to <code className={classes.path}>{pathname}</code>. It may have been moved, or never charted at all.
      </p>

      <div className={classes.actions}>
        <Link to="/home" className={`${classes.button} ${classes.primary}`}>
          <IconHome size={16} aria-hidden />
          Return home
        </Link>
        {canGoBack && (
          <button type="button" className={classes.button} onClick={() => navigate(-1)}>
            <IconArrowLeft size={16} aria-hidden />
            Go back
          </button>
        )}
      </div>
    </main>
  );
}
