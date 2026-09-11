import {beforeEach,describe,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({guard:vi.fn(),client:vi.fn(),emit:vi.fn(),cache:vi.fn()}));
vi.mock('@/lib/auth/guards',()=>({requireOrgMember:m.guard,requireOrgRole:m.guard}));
vi.mock('@/lib/supabase/server',()=>({createClient:m.client}));
vi.mock('@/lib/automations/emit',()=>({emitAfter:m.emit}));
vi.mock('@/lib/logger',()=>({logError:vi.fn()}));
vi.mock('next/cache',()=>({revalidatePath:m.cache}));
import {createDealAction} from '../lib/deals/actions';
const contactId='11111111-1111-4111-8111-111111111111',companyId='22222222-2222-4222-8222-222222222222';
beforeEach(()=>{vi.resetAllMocks();m.guard.mockResolvedValue({org:{id:'org-a'},user:{id:'user-a'}});});
describe('proposta criada pelo contato',()=>{
 it('envia empresa e contato na mesma operação e só emite após sucesso',async()=>{const rpc=vi.fn().mockResolvedValue({data:'deal-a',error:null});m.client.mockResolvedValue({rpc});const r=await createDealAction({orgSlug:'dv',name:'Proposta',companyId,contactId,stage:'proposal_sent',value:16500});expect(r).toEqual({ok:true,data:{id:'deal-a'}});expect(rpc).toHaveBeenCalledWith('create_contact_deal',expect.objectContaining({p_org_id:'org-a',p_contact_id:contactId,p_company_id:companyId,p_stage:'proposal_sent',p_value:16500}));expect(m.emit).toHaveBeenCalledTimes(1);});
 it('não anuncia sucesso nem dispara automação se a transação falhar',async()=>{m.client.mockResolvedValue({rpc:vi.fn().mockResolvedValue({data:null,error:{message:'private'}})});const r=await createDealAction({orgSlug:'dv',name:'Proposta',companyId,contactId});expect(r.ok).toBe(false);expect(m.emit).not.toHaveBeenCalled();expect(JSON.stringify(r)).not.toContain('private');});
 it('rejeita identificador de contato inválido antes de consultar banco',async()=>{const r=await createDealAction({orgSlug:'dv',name:'Proposta',companyId,contactId:'invalid'});expect(r.ok).toBe(false);expect(m.client).not.toHaveBeenCalled();});
});
