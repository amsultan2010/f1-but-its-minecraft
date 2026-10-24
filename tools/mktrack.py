# Turns a real circuit outline (GeoJSON from bacinger/f1-circuits) into a game track:
# metres, smoothed, resampled every 8 m. Usage: python3 tools/mktrack.py be-1925 1.1 6
import json, math, os, sys, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
def load(f):
    g=json.load(open(os.path.join(HERE, 'circuits', f + '.geojson'))); c=g['features'][0]['geometry']['coordinates']
    if c[0]==c[-1]: c=c[:-1]
    lat0=sum(q[1] for q in c)/len(c); lon0=sum(q[0] for q in c)/len(c); R=6371000
    return np.array([((q[0]-lon0)*math.cos(math.radians(lat0))*R*math.pi/180, -(q[1]-lat0)*R*math.pi/180) for q in c]), g['features'][0]['properties']
def resample(P, step):
    Q=np.vstack([P,P[:1]]); seg=np.linalg.norm(np.diff(Q,axis=0),axis=1); cum=np.concatenate([[0],np.cumsum(seg)])
    L=cum[-1]; n=int(round(L/step)); s=np.arange(n)*L/n
    x=np.interp(s,cum,Q[:,0]); z=np.interp(s,cum,Q[:,1]); return np.stack([x,z],1), L
def smooth(P, sig):
    n=len(P); r=int(sig*3); k=np.exp(-0.5*(np.arange(-r,r+1)/sig)**2); k/=k.sum()
    out=np.zeros_like(P)
    for j,w in enumerate(k): out+=w*np.roll(P,-(j-r),axis=0)
    return out
def radii(P, h):
    a=np.roll(P,h,0); b=np.roll(P,-h,0)
    la=np.linalg.norm(a-P,axis=1); lb=np.linalg.norm(b-P,axis=1); lc=np.linalg.norm(b-a,axis=1)
    cr=np.abs((a-P)[:,0]*(b-P)[:,1]-(a-P)[:,1]*(b-P)[:,0])
    return la*lb*lc/np.maximum(2*cr,1e-9)
def build(f, scale, sig, rmin_target=None, reverse=False):
    P,prop=load(f)
    if reverse: P=P[::-1]
    P=P*scale
    D,L=resample(P,1.0)
    D=smooth(D,sig)
    # iterative local smoothing where radius is below target (keeps the rest untouched)
    if rmin_target:
        for it in range(400):
            R=radii(D,4)
            bad=R<rmin_target
            if not bad.any(): break
            m=np.convolve(np.concatenate([bad[-6:],bad,bad[:6]]).astype(float),np.ones(13),'same')[6:-6]>0
            S=smooth(D,3)
            D[m]=D[m]*0.5+S[m]*0.5
    T,L2=resample(D,8.0)
    R=radii(D,4)
    return T, prop, L, L2, R
if __name__=='__main__':
    f=sys.argv[1]; sc=float(sys.argv[2]); sig=float(sys.argv[3]); rm=float(sys.argv[4]) if len(sys.argv)>4 else None
    T,prop,L,L2,R=build(f,sc,sig,rm)
    print(prop['Name'], 'real', prop['length'], 'geo L', round(L), 'final L', round(L2), 'n', len(T), 'minR', R.min().round(1), 'p2R', np.percentile(R,2).round(1))
