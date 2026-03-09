from fastapi import APIRouter, Depends
from app.schemas.preference import PreferenceCreate, PreferenceResponse
from app.models.preference import Preference
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=PreferenceResponse)
async def create_or_update_preference(
    pref_in: PreferenceCreate,
    current_user: User = Depends(get_current_user)
):
    pref = await Preference.find_one(Preference.user_id == str(current_user.id))
    if pref:
        for k, v in pref_in.model_dump(exclude_unset=True).items():
            setattr(pref, k, v)
        await pref.save()
    else:
        pref = Preference(**pref_in.model_dump(), user_id=str(current_user.id))
        await pref.insert()
        
    res = pref.model_dump()
    res["id"] = str(pref.id)
    return res

@router.get("/", response_model=PreferenceResponse)
async def get_preference(
    current_user: User = Depends(get_current_user)
):
    pref = await Preference.find_one(Preference.user_id == str(current_user.id))
    if not pref:
        return PreferenceResponse(user_id=str(current_user.id))
        
    res = pref.model_dump()
    res["id"] = str(pref.id)
    return res
